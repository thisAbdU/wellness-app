import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';

type DailySummary = {
  summary_date?: string;
  steps?: number;
  sleep_minutes?: number;
  active_minutes?: number;
  calories_burned?: number;
  workout_count?: number;
  wellness_score?: number;
  resting_heart_rate?: number | null;
};

function formatDateLabel(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function ActivityDayDetail() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [data, setData] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.health.daily(date);
        if (!cancelled) setData(result as DailySummary);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load day summary');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const sleepHrs =
    data?.sleep_minutes != null
      ? `${Math.floor(data.sleep_minutes / 60)}h ${data.sleep_minutes % 60}m`
      : '—';

  return (
    <AppScreen>
      <ScreenHeader title="Day summary" showBack />
      <AppText variant="subtitle">{date ? formatDateLabel(date) : '—'}</AppText>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      ) : error ? (
        <AppText variant="caption" color={Colors.light.error}>
          {error}
        </AppText>
      ) : !data ? (
        <AppText variant="caption" color={Colors.light.textSecondary}>
          No data recorded for this day.
        </AppText>
      ) : (
        <View style={styles.stats}>
          {[
            ['Steps', data.steps?.toLocaleString() ?? '—'],
            ['Sleep', sleepHrs],
            ['Active min', data.active_minutes?.toString() ?? '—'],
            ['Calories', data.calories_burned != null ? `${data.calories_burned} kcal` : '—'],
            ['Workouts', data.workout_count?.toString() ?? '—'],
            ['BIRTU score', data.wellness_score?.toString() ?? '—'],
            [
              'Resting HR',
              data.resting_heart_rate != null ? `${data.resting_heart_rate} bpm` : '—',
            ],
          ].map(([k, v]) => (
            <AppCard key={k} style={styles.stat}>
              <AppText variant="caption">{k}</AppText>
              <AppText variant="bodyStrong">{v}</AppText>
            </AppCard>
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.four },
  stat: { width: '47%', gap: Spacing.one },
  center: { marginTop: Spacing.six, alignItems: 'center' },
});
