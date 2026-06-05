import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { LeaderboardEntry } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';

const SCOPE_OPTIONS = [
  { label: 'Ethiopia', scope: 'national' },
  { label: 'Region', scope: 'region' },
  { label: 'City', scope: 'city' },
  { label: 'Org', scope: 'university' },
  { label: 'Hood', scope: 'neighborhood' },
] as const;

function scopeValue(
  scope: string,
  profile: ReturnType<typeof useAuth>['profile'],
): string | undefined {
  switch (scope) {
    case 'national':
      return undefined;
    case 'region':
      return profile?.region ?? undefined;
    case 'city':
      return profile?.city ?? undefined;
    case 'university':
      return profile?.university ?? profile?.company ?? undefined;
    case 'neighborhood':
      return profile?.neighborhood ?? undefined;
    default:
      return undefined;
  }
}

export default function LeaderboardMain() {
  const { profile, user } = useAuth();
  const [scopeLabel, setScopeLabel] = useState<string>(SCOPE_OPTIONS[0].label);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scopeDef = SCOPE_OPTIONS.find((s) => s.label === scopeLabel) ?? SCOPE_OPTIONS[0];
  const value = scopeValue(scopeDef.scope, profile);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (scopeDef.scope !== 'national' && !value) {
        setEntries([]);
        setError('Set your location to see local rankings.');
        return;
      }
      const data = await api.leaderboards.get(scopeDef.scope, value);
      setEntries(data);
    } catch (e) {
      setEntries([]);
      setError(e instanceof Error ? e.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [scopeDef.scope, value]);

  useEffect(() => {
    load();
  }, [load]);

  const myEntry = entries.find((e) => e.user_id === user?.id);
  const others = entries.filter((e) => e.user_id !== user?.id);

  return (
    <AppScreen>
      <ScreenHeader title="Leaderboard" showMenu />
      <AppCard style={styles.youCard}>
        <AppText variant="overline">Your rank</AppText>
        <AppText variant="title">{myEntry ? `#${myEntry.rank}` : '—'}</AppText>
        <AppText variant="caption">
          Score {myEntry?.value ?? '—'}
          {profile?.city ? ` · ${profile.city}` : ''}
        </AppText>
      </AppCard>
      <SegmentedControl
        options={SCOPE_OPTIONS.map((s) => s.label)}
        selected={scopeLabel}
        onSelect={setScopeLabel}
      />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      ) : error ? (
        <AppText variant="caption" style={{ marginTop: Spacing.four }}>
          {error}
        </AppText>
      ) : (
        <View style={{ marginTop: Spacing.four }}>
          {others.map((u) => (
            <LeaderboardRow
              key={u.user_id}
              name={u.full_name ?? 'Anonymous'}
              score={u.value}
              rank={u.rank}
            />
          ))}
        </View>
      )}
      {myEntry ? (
        <View style={[styles.youRow, styles.pinned]}>
          <LeaderboardRow
            name={myEntry.full_name ?? profile?.full_name ?? 'You'}
            score={myEntry.value}
            rank={myEntry.rank}
            highlight
          />
        </View>
      ) : null}
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
  rank,
  highlight,
}: {
  name: string;
  score: number;
  rank: number;
  highlight?: boolean;
}) {
  const medal =
    rank === 1
      ? Colors.light.gold
      : rank === 2
        ? Colors.light.silver
        : rank === 3
          ? Colors.light.bronze
          : undefined;

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
      </View>
      <AppText variant="bodyStrong">{Math.round(score)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  youCard: {
    marginBottom: Spacing.four,
    backgroundColor: Colors.light.primaryLight,
    gap: Spacing.one,
  },
  centered: { alignItems: 'center', padding: Spacing.four },
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
