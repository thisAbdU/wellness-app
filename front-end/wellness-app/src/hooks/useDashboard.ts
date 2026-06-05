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
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [calories, setCalories] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authLoading) return;
    if (!user?.id) {
      setStreaks([]);
      setInsight(null);
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

      setInsightLoading(true);
      const [streakData, insightData] = await Promise.all([
        api.streaks.me().catch(() => [] as Streak[]),
        api.coach.insight('DAILY_NUDGE').catch(() => null),
      ]);
      setStreaks(streakData);
      if (insightData?.insight) setInsight(insightData.insight);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setInsightLoading(false);
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
    insight,
    insightLoading,
    calories,
    loading,
    error,
    refresh,
  };
}
