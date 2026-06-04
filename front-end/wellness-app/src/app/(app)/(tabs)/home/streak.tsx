import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MOCK_USER } from '@/constants/mockData';

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
  return (
    <AppScreen>
      <ScreenHeader title="Streaks" showBack />
      <AppCard style={styles.statCard}>
        <AppText variant="overline">Daily streak</AppText>
        <AppText variant="title">{MOCK_USER.streak} days</AppText>
        <AppText variant="caption">Wellness streak: {MOCK_USER.wellnessStreak} days</AppText>
      </AppCard>
      <AppText variant="bodyStrong" style={{ marginBottom: Spacing.two }}>
        Last 30 days
      </AppText>
      <Heatmap />
      <AppText variant="overline" style={{ marginTop: Spacing.four, marginBottom: Spacing.two }}>
        Milestones
      </AppText>
      {['7-day streak', 'First workout week', 'Sleep champion'].map((b) => (
        <View key={b} style={styles.badge}>
          <AppText>🏅</AppText>
          <AppText variant="bodyStrong">{b}</AppText>
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
