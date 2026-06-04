import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';

export type HealthData = {
  steps: number | null;
  sleepHours: number | null;
  avgHeartRate: number | null;
  workoutCount: number | null;
};

export type DataSource = 'health_connect' | 'none';
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'unavailable' | 'error';

export type HealthState = {
  status: ConnectionStatus;
  data: HealthData;
  source: DataSource;
  hasAnyData: boolean;
};

const EMPTY: HealthData = {
  steps: null,
  sleepHours: null,
  avgHeartRate: null,
  workoutCount: null,
};

const UNAVAILABLE_STATE: HealthState = {
  status: 'unavailable',
  data: EMPTY,
  source: 'none',
  hasAnyData: false,
};

const ERROR_STATE: HealthState = {
  status: 'error',
  data: EMPTY,
  source: 'none',
  hasAnyData: false,
};

export function useHealthConnect(): HealthState {
  const [state, setState] = useState<HealthState>({
    status: 'idle',
    data: EMPTY,
    source: 'none',
    hasAnyData: false,
  });

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setState(UNAVAILABLE_STATE);
      return;
    }

    let cancelled = false;

    async function connect() {
      setState(s => ({ ...s, status: 'connecting' }));

      try {
        const available = await initialize();
        if (!available) {
          setState(UNAVAILABLE_STATE);
          return;
        }

        await requestPermission([
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'SleepSession' },
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'ExerciseSession' },
        ]);

        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const yesterday8pm = new Date(now);
        yesterday8pm.setDate(yesterday8pm.getDate() - 1);
        yesterday8pm.setHours(20, 0, 0, 0);

        const [stepsRes, sleepRes, hrRes, workoutRes] = await Promise.all([
          readRecords('Steps', {
            timeRangeFilter: {
              operator: 'between',
              startTime: startOfDay.toISOString(),
              endTime: now.toISOString(),
            },
          }),
          readRecords('SleepSession', {
            timeRangeFilter: {
              operator: 'between',
              startTime: yesterday8pm.toISOString(),
              endTime: now.toISOString(),
            },
          }),
          readRecords('HeartRate', {
            timeRangeFilter: {
              operator: 'between',
              startTime: startOfDay.toISOString(),
              endTime: now.toISOString(),
            },
          }),
          readRecords('ExerciseSession', {
            timeRangeFilter: {
              operator: 'between',
              startTime: startOfDay.toISOString(),
              endTime: now.toISOString(),
            },
          }),
        ]);

        if (cancelled) return;

        const steps = stepsRes.records.reduce((sum, r) => sum + r.count, 0);

        const sleepMs = sleepRes.records.reduce((sum, r) => {
          return sum + (new Date(r.endTime).getTime() - new Date(r.startTime).getTime());
        }, 0);
        const sleepHours = sleepMs > 0 ? Math.round((sleepMs / 3_600_000) * 10) / 10 : null;

        const allSamples = hrRes.records.flatMap(r => r.samples ?? []);
        const avgHeartRate =
          allSamples.length > 0
            ? Math.round(allSamples.reduce((s, x) => s + x.beatsPerMinute, 0) / allSamples.length)
            : null;

        const workoutCount = workoutRes.records.length;

        const hasAnyData = steps > 0 || sleepMs > 0 || allSamples.length > 0;

        setState({
          status: 'connected',
          source: 'health_connect',
          hasAnyData,
          data: {
            steps: steps || null,
            sleepHours,
            avgHeartRate,
            workoutCount: workoutCount || null,
          },
        });
      } catch (e) {
        if (!cancelled) setState(ERROR_STATE);
      }
    }

    connect();
    return () => { cancelled = true; };
  }, []);

  return state;
}