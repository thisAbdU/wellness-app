import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Spacing } from '@/constants/theme';

const COMPONENTS = [
  { label: 'Activity', score: 0.85, desc: 'Steps, workouts, and active minutes from Health Connect.' },
  { label: 'Sleep', score: 0.78, desc: 'Duration and consistency of your nightly rest.' },
  { label: 'Nutrition', score: 0.72, desc: 'Meal plan adherence and macro balance.' },
];

export default function WellnessScoreDetail() {
  return (
    <AppScreen>
      <ScreenHeader title="Wellness score" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        Your score blends activity, sleep, and nutrition into one daily number (0–100).
      </AppText>
      <View style={styles.center}>
        <ProgressRing
          progress={0.82}
          size={160}
          label="82"
          sublabel="Today"
        />
      </View>
      {COMPONENTS.map((c) => (
        <AppCard key={c.label} style={styles.card}>
          <View style={styles.row}>
            <ProgressRing progress={c.score} size={72} label={`${Math.round(c.score * 100)}`} />
            <View style={styles.copy}>
              <AppText variant="bodyStrong">{c.label}</AppText>
              <AppText variant="caption">{c.desc}</AppText>
            </View>
          </View>
        </AppCard>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginBottom: Spacing.four },
  card: { marginBottom: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  copy: { flex: 1, gap: Spacing.one },
});
