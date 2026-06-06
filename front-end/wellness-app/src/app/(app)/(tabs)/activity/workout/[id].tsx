import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useHealthConnect } from '@/hooks/useHealthConnect';

export default function WorkoutDetail() {
  const { id, type, duration, calories, source } = useLocalSearchParams<{
    id: string;
    type?: string;
    duration?: string;
    calories?: string;
    source?: string;
  }>();
  const { workouts } = useHealthConnect();

  const workout = useMemo(() => {
    const fromHc = workouts.find((w) => w.id === id);
    if (fromHc) return fromHc;
    if (type) {
      return {
        id: id ?? 'unknown',
        type,
        durationMin: parseInt(duration ?? '0', 10) || 0,
        calories: parseInt(calories ?? '0', 10) || null,
        source: source ?? 'Manual',
        startTime: '',
        endTime: '',
      };
    }
    return null;
  }, [workouts, id, type, duration, calories, source]);

  return (
    <AppScreen>
      <ScreenHeader title="Workout" showBack />
      {workout ? (
        <>
          <AppBadge label={workout.source} />
          <AppText variant="title" style={{ marginTop: Spacing.two }}>
            {workout.type}
          </AppText>
          {workout.startTime ? (
            <AppText variant="caption">
              {new Date(workout.startTime).toLocaleTimeString('en', {
                hour: 'numeric',
                minute: '2-digit',
              })}
              {' – '}
              {new Date(workout.endTime).toLocaleTimeString('en', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </AppText>
          ) : (
            <AppText variant="caption">ID: {id}</AppText>
          )}
          <View style={styles.stats}>
            {[
              ['Duration', workout.durationMin ? `${workout.durationMin} min` : ''],
              ['Calories', workout.calories != null ? `${workout.calories} kcal` : ''],
              ['Avg HR', ''],
              ['Zones', ''],
            ].map(([k, v]) => (
              <AppCard key={k} style={styles.stat}>
                <AppText variant="caption">{k}</AppText>
                <AppText variant="bodyStrong">{v}</AppText>
              </AppCard>
            ))}
          </View>
        </>
      ) : (
        <AppText variant="caption" color={Colors.light.textSecondary}>
          Workout not found. It may have been removed from Health Connect.
        </AppText>
      )}
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
