import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  fetchBadgesWithState,
  formatEarnedDate,
  type BadgeWithState,
} from '@/services/badgeService';

export function BadgesScreen() {
  const [badges, setBadges] = useState<BadgeWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBadges(await fetchBadgesWithState());
    } catch (loadError) {
      setBadges([]);
      setError(loadError instanceof Error ? loadError.message : 'Could not load badges.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="Badges" showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  const earnedCount = badges.filter((badge) => badge.earned).length;
  const progress = badges.length > 0 ? earnedCount / badges.length : 0;

  return (
    <AppScreen>
      <ScreenHeader title="Badges" showBack />
      <AppCard style={styles.summary}>
        <View style={styles.summaryHeader}>
          <View>
            <AppText variant="overline">Collection progress</AppText>
            <AppText variant="subtitle">
              {earnedCount} of {badges.length} earned
            </AppText>
          </View>
          <AppText variant="title">{Math.round(progress * 100)}%</AppText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </AppCard>

      {error ? (
        <AppCard style={styles.errorCard}>
          <AppText variant="bodyStrong">Badges unavailable</AppText>
          <AppText variant="caption">{error}</AppText>
          <AppButton label="Try again" variant="secondary" onPress={load} />
        </AppCard>
      ) : badges.length === 0 ? (
        <AppText variant="caption">No badges are available yet.</AppText>
      ) : (
        <View style={styles.list}>
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

function BadgeCard({ badge }: { badge: BadgeWithState }) {
  const earnedDate = formatEarnedDate(badge.earned_at);

  return (
    <AppCard style={[styles.badgeCard, !badge.earned && styles.lockedCard]}>
      <View style={[styles.icon, !badge.earned && styles.lockedIcon]}>
        <AppText style={styles.iconText}>{badge.earned ? (badge.icon ?? '🏅') : '🔒'}</AppText>
      </View>
      <View style={styles.badgeDetails}>
        <View style={styles.badgeHeader}>
          <AppText variant="bodyStrong" style={styles.badgeName}>
            {badge.name}
          </AppText>
          <View style={[styles.state, badge.earned ? styles.earnedState : styles.lockedState]}>
            <AppText
              variant="overline"
              color={badge.earned ? Colors.light.success : Colors.light.textSecondary}
            >
              {badge.earned ? 'Earned' : 'Locked'}
            </AppText>
          </View>
        </View>
        <AppText variant="caption">
          {badge.description ?? 'Complete its goal to unlock this badge.'}
        </AppText>
        {earnedDate ? (
          <AppText variant="caption" color={Colors.light.success}>
            Earned {earnedDate}
          </AppText>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  summary: { gap: Spacing.three, backgroundColor: Colors.light.primaryLight },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.light.primary },
  errorCard: { gap: Spacing.two, marginTop: Spacing.four },
  list: { gap: Spacing.three, marginTop: Spacing.four },
  badgeCard: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  lockedCard: { backgroundColor: Colors.light.background },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIcon: { backgroundColor: Colors.light.border },
  iconText: { fontSize: 28 },
  badgeDetails: { flex: 1, gap: Spacing.one },
  badgeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  badgeName: { flex: 1 },
  state: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  earnedState: { backgroundColor: Colors.light.primaryLight },
  lockedState: { backgroundColor: Colors.light.border },
});
