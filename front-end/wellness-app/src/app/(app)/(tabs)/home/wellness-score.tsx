import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Colors, Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/useDashboard';
import type { WellnessScore } from '@/lib/api/types';

const COMPONENT_META: {
  key: keyof WellnessScore;
  label: string;
  desc: string;
}[] = [
  {
    key: 'activity_score',
    label: 'Activity',
    desc: 'Steps, workouts, and active minutes from Health Connect.',
  },
  {
    key: 'sleep_score',
    label: 'Sleep',
    desc: 'Duration and consistency of your nightly rest.',
  },
  {
    key: 'recovery_score',
    label: 'Recovery',
    desc: 'Resting heart rate and recovery signals.',
  },
  {
    key: 'consistency_score',
    label: 'Consistency',
    desc: 'How regularly you hit your daily wellness habits.',
  },
];

export default function WellnessScoreDetail() {
  const { wellnessScore, loading, error, refresh } = useDashboard();
  const total = wellnessScore?.total_score ?? 0;
  const progress = total / 100;

  if (loading && !wellnessScore) {
    return (
      <AppScreen>
        <ScreenHeader title="Wellness score" showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Wellness score" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        Your score blends activity, sleep, and nutrition into one daily number (0–100).
      </AppText>

      {error ? (
        <View style={styles.errorBox}>
          <AppText variant="caption" color={Colors.light.error}>
            {error}
          </AppText>
          <AppButton label="Retry" variant="ghost" onPress={refresh} style={{ marginTop: Spacing.two }} />
        </View>
      ) : null}

      <View style={styles.center}>
        <ProgressRing progress={progress} size={160} label={String(total)} sublabel="Today" />
      </View>
      {COMPONENT_META.map((c) => {
        const raw = wellnessScore?.[c.key] ?? 0;
        const score = raw / 100;
        return (
          <AppCard key={c.label} style={styles.card}>
            <View style={styles.row}>
              <ProgressRing progress={score} size={72} label={`${Math.round(raw)}`} />
              <View style={styles.copy}>
                <AppText variant="bodyStrong">{c.label}</AppText>
                <AppText variant="caption">{c.desc}</AppText>
              </View>
            </View>
          </AppCard>
        );
      })}
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
    borderRadius: 8,
  },
  center: { alignItems: 'center', marginBottom: Spacing.four },
  card: { marginBottom: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  copy: { flex: 1, gap: Spacing.one },
});
