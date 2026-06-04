import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MOCK_LEADERBOARD, MOCK_USER } from '@/constants/mockData';

const SCOPES = ['Ethiopia', 'Region', 'City', 'Org', 'Hood'];

export default function LeaderboardMain() {
  const router = useRouter();
  const [scope, setScope] = useState('Ethiopia');

  return (
    <AppScreen>
      <ScreenHeader title="Leaderboard" showMenu />
      <AppCard style={styles.youCard}>
        <AppText variant="overline">Your rank</AppText>
        <AppText variant="title">#{MOCK_USER.rank}</AppText>
        <AppText variant="caption">
          Score {MOCK_USER.wellnessScore} · 🔥 {MOCK_USER.streak} streak
        </AppText>
      </AppCard>
      <SegmentedControl options={SCOPES} selected={scope} onSelect={setScope} />
      <View style={{ marginTop: Spacing.four }}>
        {MOCK_LEADERBOARD.map((u) => (
          <LeaderboardRow key={u.id} {...u} />
        ))}
      </View>
      <View style={[styles.youRow, styles.pinned]}>
        <LeaderboardRow
          name={MOCK_USER.name}
          score={MOCK_USER.wellnessScore}
          streak={MOCK_USER.streak}
          rank={MOCK_USER.rank}
          highlight
        />
      </View>
      <TouchableOpacity
        style={{ marginTop: Spacing.three }}
        onPress={() => navigate('/(app)/(tabs)/leaderboard/location-setup')}
      >
        <AppText variant="link">Set location for local rankings →</AppText>
      </TouchableOpacity>
    </AppScreen>
  );
}

function LeaderboardRow({
  name,
  score,
  streak,
  rank,
  highlight,
}: {
  name: string;
  score: number;
  streak: number;
  rank: number;
  highlight?: boolean;
}) {
  const medal =
    rank === 1 ? Colors.light.gold : rank === 2 ? Colors.light.silver : rank === 3 ? Colors.light.bronze : undefined;

  return (
    <View style={[styles.row, highlight && styles.rowHighlight]}>
      <AppText variant="bodyStrong" color={medal}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
      </AppText>
      <View style={styles.avatar}>
        <AppText variant="caption">{name.slice(0, 2).toUpperCase()}</AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{name}</AppText>
        <AppText variant="caption">🔥 {streak}</AppText>
      </View>
      <AppText variant="bodyStrong">{score}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  youCard: {
    marginBottom: Spacing.four,
    backgroundColor: Colors.light.primaryLight,
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.border,
  },
  rowHighlight: {
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youRow: { marginTop: Spacing.two },
  pinned: {
    borderTopWidth: 2,
    borderTopColor: Colors.light.primary,
    paddingTop: Spacing.three,
  },
});
