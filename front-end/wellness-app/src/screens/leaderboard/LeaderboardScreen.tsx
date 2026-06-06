import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ETHIOPIA_CITIES } from '@/constants/ethiopia';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import type { LeaderboardEntry } from '@/lib/api/types';
import {
  fetchLeaderboard,
  formatLeaderboardValue,
  type LeaderboardMetric,
  type LeaderboardScope,
} from '@/services/leaderboardService';

const SCOPE_LABELS: Record<LeaderboardScope, string> = {
  national: 'National',
  city: 'City',
};

const METRIC_LABELS: Record<LeaderboardMetric, string> = {
  wellness_score: 'Wellness score',
  steps: 'Steps',
  streak: 'Streak',
};

const QUICK_CITIES = ETHIOPIA_CITIES.slice(0, 4);

function valueFromLabel<T extends string>(labels: Record<T, string>, label: string): T {
  return (Object.keys(labels) as T[]).find((key) => labels[key] === label) ?? Object.keys(labels)[0] as T;
}

export function LeaderboardScreen() {
  const { profile, user } = useAuth();
  const [scope, setScope] = useState<LeaderboardScope>('national');
  const [metric, setMetric] = useState<LeaderboardMetric>('wellness_score');
  const [city, setCity] = useState(profile?.city ?? 'Addis Ababa');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await fetchLeaderboard({ scope, metric, city }));
    } catch (loadError) {
      setEntries([]);
      setError(loadError instanceof Error ? loadError.message : 'Could not load leaderboard.');
    } finally {
      setLoading(false);
    }
  }, [city, metric, scope]);

  useEffect(() => {
    load();
  }, [load]);

  const myEntry = entries.find((entry) => entry.user_id === user?.id);

  return (
    <AppScreen keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Leaderboard" showMenu />
      <AppCard style={styles.summary}>
        <AppText variant="overline">Your rank</AppText>
        <AppText variant="title">{myEntry ? `#${myEntry.rank}` : 'Not ranked'}</AppText>
        <AppText variant="caption">
          {myEntry
            ? formatLeaderboardValue(myEntry.value, metric)
            : `No ${METRIC_LABELS[metric].toLowerCase()} result in this leaderboard yet.`}
        </AppText>
      </AppCard>

      <SelectorLabel label="Scope" />
      <SegmentedControl
        options={Object.values(SCOPE_LABELS)}
        selected={SCOPE_LABELS[scope]}
        onSelect={(label) => setScope(valueFromLabel(SCOPE_LABELS, label))}
      />

      {scope === 'city' ? (
        <View style={styles.cityControls}>
          <AuthTextField
            label="City"
            value={city}
            onChangeText={setCity}
            onSubmitEditing={load}
            returnKeyType="search"
            placeholder="Enter city"
          />
          <View style={styles.cityOptions}>
            {QUICK_CITIES.map((option) => (
              <Pressable
                key={option}
                onPress={() => setCity(option)}
                style={[styles.cityChip, city === option && styles.cityChipSelected]}
              >
                <AppText
                  variant="caption"
                  color={city === option ? Colors.light.primary : Colors.light.textSecondary}
                >
                  {option}
                </AppText>
              </Pressable>
            ))}
          </View>
          <AppButton label={`Load ${city || 'city'} rankings`} variant="secondary" onPress={load} />
        </View>
      ) : null}

      <SelectorLabel label="Metric" />
      <SegmentedControl
        options={Object.values(METRIC_LABELS)}
        selected={METRIC_LABELS[metric]}
        onSelect={(label) => setMetric(valueFromLabel(METRIC_LABELS, label))}
      />

      <View style={styles.listHeader}>
        <AppText variant="overline">Rankings</AppText>
        <AppText variant="caption">
          {scope === 'national' ? 'National' : city} · {METRIC_LABELS[metric]}
        </AppText>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      ) : error ? (
        <AppCard style={styles.errorCard}>
          <AppText variant="bodyStrong">Leaderboard unavailable</AppText>
          <AppText variant="caption">{error}</AppText>
          <AppButton label="Try again" variant="secondary" onPress={load} />
        </AppCard>
      ) : entries.length === 0 ? (
        <AppText variant="caption">No leaderboard results found.</AppText>
      ) : (
        entries.map((entry) => (
          <LeaderboardRow
            key={entry.user_id}
            entry={entry}
            metric={metric}
            highlight={entry.user_id === user?.id}
          />
        ))
      )}
    </AppScreen>
  );
}

function SelectorLabel({ label }: { label: string }) {
  return <AppText variant="overline" style={styles.selectorLabel}>{label}</AppText>;
}

function LeaderboardRow({
  entry,
  metric,
  highlight,
}: {
  entry: LeaderboardEntry;
  metric: LeaderboardMetric;
  highlight: boolean;
}) {
  const name = entry.full_name?.trim() || 'Anonymous';
  return (
    <View style={[styles.row, highlight && styles.rowHighlight]}>
      <AppText variant="bodyStrong" style={styles.rank}>#{entry.rank}</AppText>
      {entry.avatar_url ? (
        <Image source={{ uri: entry.avatar_url }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={styles.avatarFallback}>
          <AppText variant="caption">{name.slice(0, 2).toUpperCase()}</AppText>
        </View>
      )}
      <View style={styles.name}>
        <AppText variant="bodyStrong">{name}</AppText>
        {entry.city ? <AppText variant="caption">{entry.city}</AppText> : null}
      </View>
      <AppText variant="bodyStrong">{formatLeaderboardValue(entry.value, metric)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { gap: Spacing.one, backgroundColor: Colors.light.primaryLight },
  selectorLabel: { marginTop: Spacing.four, marginBottom: Spacing.two },
  cityControls: { gap: Spacing.two, marginTop: Spacing.three },
  cityOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  cityChip: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.light.backgroundElement,
  },
  cityChipSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  listHeader: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  centered: { alignItems: 'center', padding: Spacing.four },
  errorCard: { gap: Spacing.two },
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
  rank: { width: 34 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.light.primaryLight },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1 },
});
