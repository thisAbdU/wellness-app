import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';

const HISTORY = [
  { date: 'Jun 3, 2026', followed: true },
  { date: 'Jun 2, 2026', followed: false },
  { date: 'Jun 1, 2026', followed: true },
];

export default function NutritionHistory() {
  return (
    <AppScreen>
      <ScreenHeader title="History" showBack />
      {HISTORY.map((h) => (
        <AppCard key={h.date} style={styles.row}>
          <View>
            <AppText variant="bodyStrong">{h.date}</AppText>
            <AppText variant="caption">Daily plan</AppText>
          </View>
          <AppText variant="caption" color={h.followed ? Colors.light.success : Colors.light.warning}>
            {h.followed ? 'Followed' : 'Partial'}
          </AppText>
        </AppCard>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
