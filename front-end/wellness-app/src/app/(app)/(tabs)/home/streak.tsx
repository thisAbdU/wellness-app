import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Streak } from '@/lib/api/types';

function Heatmap() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const level = [0, 1, 2, 3][i % 4];
    const colors = [
      Colors.light.border,
      Colors.light.warning,
      Colors.light.primaryLight,
      Colors.light.primary,
    ];
    return <View key={i} style={[styles.cell, { backgroundColor: colors[level] }]} />;
  });
  return <View style={styles.heatmap}>{days}</View>;
}

export default function StreakDetail() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.streaks.me();
      setStreaks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load streaks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const wellnessStreak = streaks.find((s) => s.streak_type === 'wellness');
  const activityStreak = streaks.find((s) => s.streak_type === 'activity');
  const primaryCount = activityStreak?.current_count ?? wellnessStreak?.current_count ?? 0;
  const wellnessCount = wellnessStreak?.current_count ?? 0;
  const longest = Math.max(
    ...streaks.map((s) => s.longest_count),
    0,
  );

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="Streaks" showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Streaks" showBack />

      {error ? (
        <View style={styles.errorBox}>
          <AppText variant="caption" color={Colors.light.error}>
            {error}
          </AppText>
          <AppButton label="Retry" variant="ghost" onPress={load} loading={loading} />
        </View>
      ) : null}

      <AppCard style={styles.statCard}>
        <AppText variant="overline">Daily streak</AppText>
        <AppText variant="title">{primaryCount} days</AppText>
        <AppText variant="caption">BIRTU streak: {wellnessCount} days</AppText>
        {longest > 0 ? (
          <AppText variant="caption">Longest streak: {longest} days</AppText>
        ) : null}
      </AppCard>
      <AppText variant="bodyStrong" style={{ marginBottom: Spacing.two }}>
        Last 30 days
      </AppText>
      <Heatmap />
      <AppText variant="overline" style={{ marginTop: Spacing.four, marginBottom: Spacing.two }}>
        Milestones
      </AppText>
      {streaks.length > 0 ? (
        streaks.map((s) => (
          <View key={s.streak_type} style={styles.badge}>
            <AppText>🏅</AppText>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">
                {s.streak_type.charAt(0).toUpperCase() + s.streak_type.slice(1)} streak
              </AppText>
              <AppText variant="caption">
                {s.current_count} days · Best {s.longest_count} days
              </AppText>
            </View>
          </View>
        ))
      ) : (
        <AppText variant="caption">No streaks yet — keep logging activity to build momentum.</AppText>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
  errorBox: {
    marginBottom: Spacing.three,
    padding: Spacing.three,
    backgroundColor: '#FDEDED',
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  statCard: { marginBottom: Spacing.four, gap: Spacing.one },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: 18, height: 18, borderRadius: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    marginBottom: Spacing.two,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
  },
});
