import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Streak, WellnessScore } from '@/lib/api/types';
import { getLastSyncResult, syncHealthFromDevice } from '@/services/healthSyncService';
import { useHealthConnect } from './useHealthConnect';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboard() {
  const { profile, user, isLoading: authLoading } = useAuth();
  const health = useHealthConnect();
  const [wellnessScore, setWellnessScore] = useState<WellnessScore | null>(null);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [calories, setCalories] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authLoading) return;
    if (!user?.id) {
      setStreaks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (health.hasAnyData) {
        const syncResult = await syncHealthFromDevice(health.data);
        if (syncResult?.wellness_score) {
          setWellnessScore(syncResult.wellness_score);
        }
        const summary = syncResult?.health_summary as { calories_burned?: number } | undefined;
        if (summary?.calories_burned) setCalories(Number(summary.calories_burned));
      } else {
        const cached = getLastSyncResult();
        if (cached?.wellness_score) setWellnessScore(cached.wellness_score);
      }

      const streakData = await api.streaks.me();
      setStreaks(streakData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.id, health.hasAnyData, health.data]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const wellnessStreak =
    streaks.find((s) => s.streak_type === 'wellness')?.current_count ?? 0;
  const activityStreak =
    streaks.find((s) => s.streak_type === 'activity')?.current_count ?? wellnessStreak;

  return {
    profile,
    health,
    wellnessScore,
    streaks,
    wellnessStreak,
    activityStreak,
    calories,
    loading,
    error,
    refresh,
  };
}
