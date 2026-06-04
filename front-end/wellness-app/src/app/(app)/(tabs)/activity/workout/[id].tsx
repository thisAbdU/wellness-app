import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppScreen>
      <ScreenHeader title="Workout" showBack />
      <AppBadge label="Garmin" />
      <AppText variant="title" style={{ marginTop: Spacing.two }}>
        Morning Run
      </AppText>
      <AppText variant="caption">ID: {id}</AppText>
      <View style={styles.stats}>
        {[
          ['Duration', '32 min'],
          ['Calories', '280 kcal'],
          ['Avg HR', '142 bpm'],
          ['Zones', 'Z2–Z3'],
        ].map(([k, v]) => (
          <AppCard key={k} style={styles.stat}>
            <AppText variant="caption">{k}</AppText>
            <AppText variant="bodyStrong">{v}</AppText>
          </AppCard>
        ))}
      </View>
      <View style={styles.map}>
        <AppText variant="caption" color={Colors.light.textSecondary}>
          Map route (GPS)
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.four },
  stat: { width: '47%', gap: Spacing.one },
  map: {
    height: 160,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
});
