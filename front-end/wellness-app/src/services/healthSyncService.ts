import { api } from '@/lib/api';
import type { HealthSyncResult } from '@/lib/api/types';
import type { HealthData } from '@/hooks/useHealthConnect';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function healthDataToPayload(data: HealthData) {
  const sleepMinutes = data.sleepHours ? Math.round(data.sleepHours * 60) : 0;
  return {
    summary_date: todayIso(),
    steps: data.steps ?? 0,
    calories_burned: 0,
    active_minutes: 0,
    sleep_minutes: sleepMinutes,
    sleep_quality_score: sleepMinutes >= 420 ? 80 : sleepMinutes >= 360 ? 60 : 40,
    resting_heart_rate: data.avgHeartRate,
    workout_count: data.workoutCount ?? 0,
    data_source: 'health_connect',
  };
}

let lastSyncResult: HealthSyncResult | null = null;

export function getLastSyncResult(): HealthSyncResult | null {
  return lastSyncResult;
}

export async function syncHealthFromDevice(data: HealthData): Promise<HealthSyncResult | null> {
  if (!data.steps && !data.sleepHours && !data.avgHeartRate && !data.workoutCount) {
    return null;
  }
  const payload = healthDataToPayload(data);
  const result = await api.health.sync(payload);
  lastSyncResult = result;
  return result;
}

export async function syncManualWorkout(
  workoutType: string,
  durationMin: number,
): Promise<HealthSyncResult> {
  const result = await api.health.sync({
    summary_date: todayIso(),
    steps: 0,
    calories_burned: durationMin * 8,
    active_minutes: durationMin,
    sleep_minutes: 0,
    workout_count: 1,
    data_source: `manual:${workoutType}`,
  });
  lastSyncResult = result;
  return result;
}
