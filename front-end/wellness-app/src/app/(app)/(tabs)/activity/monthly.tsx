import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { navigate } from '@/lib/router';
import { api } from '@/lib/api';
import type { MonthlyAnalytics, WeeklyAnalytics } from '@/lib/api/types';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';

const LEVEL_COLORS = [
  Colors.light.border,
  Colors.light.error,
  Colors.light.warning,
  Colors.light.primaryLight,
  Colors.light.primary,
];

function wellnessLevel(score: number | undefined): number {
  if (score == null) return 0;
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

function daysInRange(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const cur = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export default function ActivityMonthly() {
  const [monthly, setMonthly] = useState<MonthlyAnalytics | null>(null);
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [m, w] = await Promise.all([api.analytics.monthly(), api.analytics.weekly()]);
        if (!cancelled) {
          setMonthly(m);
          setWeekly(w);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load monthly data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const wellnessByDay = useMemo(() => {
    const map = new Map<string, number>();
    weekly?.days.forEach((d, i) => map.set(d, weekly.wellness_scores[i]));
    return map;
  }, [weekly]);

  const calendarDays = useMemo(() => {
    if (!monthly) return [];
    return daysInRange(monthly.start_date, monthly.end_date);
  }, [monthly]);

  return (
    <AppScreen>
      <ScreenHeader title="Monthly overview" showBack />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      ) : error ? (
        <AppText variant="caption" color={Colors.light.error}>
          {error}
        </AppText>
      ) : (
        <>
          {monthly ? (
            <AppCard style={styles.summary}>
              <AppText variant="bodyStrong">
                Avg BIRTU score: {Math.round(monthly.average_wellness_score)}
              </AppText>
              <AppText variant="caption">
                {monthly.average_steps.toLocaleString()} steps/day ·{' '}
                {Math.round(monthly.average_sleep_minutes / 60)}h sleep ·{' '}
                {monthly.total_workouts} workouts
              </AppText>
            </AppCard>
          ) : null}
          <View style={styles.grid}>
            {calendarDays.map((date) => {
              const level = wellnessLevel(wellnessByDay.get(date));
              const dayNum = new Date(date + 'T12:00:00').getDate();
              return (
                <TouchableOpacity
                  key={date}
                  style={[styles.day, { backgroundColor: LEVEL_COLORS[level] }]}
                  onPress={() => navigate(`/(app)/(tabs)/activity/day/${date}`)}
                >
                  <AppText variant="caption" style={styles.dayNum}>
                    {dayNum}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
          <AppText variant="caption" style={{ marginTop: Spacing.three }}>
            Tap a day for full summary (green = goal met, amber = partial, red = missed).
          </AppText>
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summary: { marginBottom: Spacing.four, gap: Spacing.one },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  day: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: { fontSize: 11, color: Colors.light.text },
  center: { marginTop: Spacing.six, alignItems: 'center' },
});
