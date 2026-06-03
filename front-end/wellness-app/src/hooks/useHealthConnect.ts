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

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'unavailable' | 'error';

export type HealthState = {
  status: ConnectionStatus;
  data: HealthData;
};

const EMPTY: HealthData = {
  steps: null,
  sleepHours: null,
  avgHeartRate: null,
  workoutCount: null,
};

export function useHealthConnect(): HealthState {
  const [state, setState] = useState<HealthState>({
    status: 'idle',
    data: EMPTY,
  });

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setState({ status: 'unavailable', data: EMPTY });
      return;
    }

    let cancelled = false;

    async function connect() {
      setState(s => ({ ...s, status: 'connecting' }));

      try {
        const available = await initialize();
        if (!available) {
          setState({ status: 'unavailable', data: EMPTY });
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

        // ── fetch all 4 in parallel ──────────────────────────────────────────
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

        // ── steps ────────────────────────────────────────────────────────────
        const steps = stepsRes.records.reduce((sum, r) => sum + r.count, 0);

        // ── sleep in hours ───────────────────────────────────────────────────
        const sleepMs = sleepRes.records.reduce((sum, r) => {
          return sum + (new Date(r.endTime).getTime() - new Date(r.startTime).getTime());
        }, 0);
        const sleepHours = sleepMs > 0 ? Math.round((sleepMs / 3_600_000) * 10) / 10 : null;

        // ── avg heart rate ───────────────────────────────────────────────────
        const allSamples = hrRes.records.flatMap(r => r.samples ?? []);
        const avgHeartRate =
          allSamples.length > 0
            ? Math.round(allSamples.reduce((s, x) => s + x.beatsPerMinute, 0) / allSamples.length)
            : null;

        // ── workout count ────────────────────────────────────────────────────
        const workoutCount = workoutRes.records.length;

        setState({
          status: 'connected',
          data: {
            steps: steps || null,
            sleepHours,
            avgHeartRate,
            workoutCount: workoutCount || null,
          },
        });
      } catch (e) {
        if (!cancelled) setState({ status: 'error', data: EMPTY });
      }
    }

    connect();
    return () => { cancelled = true; };
  }, []);

  return state;
}