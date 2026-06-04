import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';

export default function ActivityMonthly() {
  const levels = [0, 1, 2, 3];
  const colors = [
    Colors.light.error,
    Colors.light.warning,
    Colors.light.primaryLight,
    Colors.light.primary,
  ];

  return (
    <AppScreen>
      <ScreenHeader title="Monthly overview" showBack />
      <View style={styles.grid}>
        {Array.from({ length: 28 }).map((_, i) => (
          <View
            key={i}
            style={[styles.day, { backgroundColor: colors[levels[i % 4]] }]}
          />
        ))}
      </View>
      <AppText variant="caption" style={{ marginTop: Spacing.three }}>
        Tap a day for full summary (green = goal met, amber = partial, red = missed).
      </AppText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  day: { width: 40, height: 40, borderRadius: 8 },
});
