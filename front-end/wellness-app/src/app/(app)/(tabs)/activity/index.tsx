import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AppCard } from '@/components/ui/AppCard';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MOCK_WORKOUTS } from '@/constants/mockData';
import { useHealthConnect } from '@/hooks/useHealthConnect';

export default function ActivityToday() {
  const router = useRouter();
  const { data } = useHealthConnect();
  const steps = data.steps ?? 8432;

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
          { label: 'Heart rate', value: `${data.avgHeartRate ?? 68} bpm` },
          { label: 'Active cal', value: '420' },
          { label: 'Distance', value: '5.2 km' },
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
      {MOCK_WORKOUTS.map((w) => (
        <TouchableOpacity
          key={w.id}
          onPress={() => navigate(`/(app)/(tabs)/activity/workout/${w.id}`)}
        >
          <AppCard style={styles.workout}>
            <AppText variant="bodyStrong">{w.type}</AppText>
            <AppText variant="caption">
              {w.duration} · {w.calories} kcal · {w.source}
            </AppText>
          </AppCard>
        </TouchableOpacity>
      ))}
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  cta: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
  },
});
