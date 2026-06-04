import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  MOCK_CHALLENGES_ACTIVE,
  MOCK_CHALLENGES_AVAILABLE,
} from '@/constants/mockData';

export default function ChallengesBrowse() {
  const router = useRouter();

  return (
    <AppScreen>
      <ScreenHeader title="Challenges" showMenu />
      <AppText variant="overline" style={styles.section}>
        Active
      </AppText>
      {MOCK_CHALLENGES_ACTIVE.map((c) => (
        <TouchableOpacity
          key={c.id}
          onPress={() => navigate(`/(app)/(tabs)/challenges/${c.id}`)}
        >
          <ChallengeCard {...c} active />
        </TouchableOpacity>
      ))}
      <AppText variant="overline" style={styles.section}>
        Available
      </AppText>
      {MOCK_CHALLENGES_AVAILABLE.map((c) => (
        <TouchableOpacity
          key={c.id}
          onPress={() => navigate(`/(app)/(tabs)/challenges/start/${c.id}`)}
        >
          <ChallengeCard {...c} />
        </TouchableOpacity>
      ))}
    </AppScreen>
  );
}

function ChallengeCard({
  icon,
  title,
  duration,
  metric,
  progress,
  active,
}: {
  icon: string;
  title: string;
  duration: string;
  metric: string;
  progress?: number;
  active?: boolean;
}) {
  return (
    <AppCard style={styles.card}>
      <AppText style={{ fontSize: 28 }}>{icon}</AppText>
      <AppText variant="bodyStrong">{title}</AppText>
      <AppText variant="caption">
        {duration} · {metric}
      </AppText>
      {active && progress != null ? (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.three, marginBottom: Spacing.two },
  card: { marginBottom: Spacing.three, gap: Spacing.one },
  barTrack: {
    height: 6,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.pill,
    marginTop: Spacing.two,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: Colors.light.primary },
});
