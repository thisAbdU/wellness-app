import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AppCard } from '@/components/ui/AppCard';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useHealthConnect } from '@/hooks/useHealthConnect';

export default function ActivityToday() {
  const { status, data, workouts } = useHealthConnect();
  const steps = data.steps ?? 0;
  const distanceKm =
    data.steps != null ? (Math.round(data.steps * 0.0008 * 10) / 10).toFixed(1) : '';

  useEffect(() => {
    if (status === 'unavailable') {
      replace('/(app)/(tabs)/activity/no-device');
    }
  }, [status]);

  if (status === 'idle' || status === 'connecting') {
    return (
      <AppScreen>
        <ScreenHeader title="Activity" showMenu />
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.light.primary} />
          <AppText variant="caption">Loading health data…</AppText>
        </View>
      </AppScreen>
    );
  }

  if (status === 'unavailable') {
    return null;
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Activity"
        showMenu
        right={
          <TouchableOpacity onPress={() => navigate('/(app)/(tabs)/activity/weekly')}>
            <AppText variant="link">Trends</AppText>
          </TouchableOpacity>
        }
      />
      <View style={styles.ringRow}>
        <ProgressRing
          progress={steps / 10000}
          size={180}
          label={steps.toLocaleString()}
          sublabel="steps"
        />
      </View>
      <View style={styles.statsRow}>
        {[
          {
            label: 'Heart rate',
            value: data.avgHeartRate != null ? `${data.avgHeartRate} bpm` : '',
          },
          {
            label: 'Active cal',
            value: workouts.length
              ? `${workouts.reduce((s, w) => s + (w.calories ?? 0), 0)}`
              : '',
          },
          { label: 'Distance', value: distanceKm === '' ? '' : `${distanceKm} km` },
        ].map((s) => (
          <AppCard key={s.label} style={styles.stat}>
            <AppText variant="caption">{s.label}</AppText>
            <AppText variant="bodyStrong">{s.value}</AppText>
          </AppCard>
        ))}
      </View>
      <AppText variant="overline" style={{ marginBottom: Spacing.two }}>
        Workouts today
      </AppText>
      {workouts.length === 0 ? (
        <AppText variant="caption" color={Colors.light.textSecondary}>
          No workouts recorded today. Tap below to log one manually.
        </AppText>
      ) : (
        workouts.map((w) => (
          <TouchableOpacity
            key={w.id}
            onPress={() =>
              navigate(
                `/(app)/(tabs)/activity/workout/${w.id}?type=${encodeURIComponent(w.type)}&duration=${w.durationMin}&calories=${w.calories ?? 0}&source=${encodeURIComponent(w.source)}`,
              )
            }
          >
            <AppCard style={styles.workout}>
              <AppText variant="bodyStrong">{w.type}</AppText>
              <AppText variant="caption">
                {w.durationMin} min · {w.calories ?? ''} kcal · {w.source}
              </AppText>
            </AppCard>
          </TouchableOpacity>
        ))
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigate('/(app)/(tabs)/activity/manual-entry')}
      >
        <AppText variant="bodyStrong" color="#fff">
          + Start workout
        </AppText>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: Spacing.three }}
        onPress={() => navigate('/(app)/(tabs)/activity/devices')}
      >
        <AppText variant="link">Device connections →</AppText>
      </TouchableOpacity>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  ringRow: { alignItems: 'center', marginVertical: Spacing.four },
  statsRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.four },
  stat: { flex: 1, alignItems: 'center', gap: Spacing.one },
  workout: { marginBottom: Spacing.two },
  fab: {
    position: 'relative',
    marginTop: Spacing.four,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
});
