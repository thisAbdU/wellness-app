import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Badge } from '@/lib/api/types';

export default function BadgesScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.badges.me();
      setBadges(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load badges');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const earnedCount = badges.filter((b) => b.earned_at).length;
  const progress = badges.length > 0 ? (earnedCount / badges.length) * 100 : 0;

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="Badges & levels" showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Badges & levels" showBack />

      {error ? (
        <View style={styles.errorBox}>
          <AppText variant="caption" color={Colors.light.error}>
            {error}
          </AppText>
          <AppButton label="Retry" variant="ghost" onPress={load} loading={loading} />
        </View>
      ) : null}

      <View style={styles.level}>
        <AppText variant="caption">
          Level: {earnedCount > 0 ? 'Active' : 'Getting started'}
        </AppText>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
        <AppText variant="caption">
          {earnedCount} of {badges.length} badges earned
        </AppText>
      </View>
      <View style={styles.grid}>
        {badges.length > 0 ? (
          badges.map((b) => {
            const earned = Boolean(b.earned_at);
            return (
              <Pressable key={b.id} style={[styles.badge, !earned && styles.locked]}>
                <AppText style={{ fontSize: 32, opacity: earned ? 1 : 0.35 }}>
                  {earned ? (b.icon ?? '🏅') : '🔒'}
                </AppText>
                <AppText variant="caption" align="center">
                  {b.name}
                </AppText>
              </Pressable>
            );
          })
        ) : (
          <AppText variant="caption">No badges yet — complete challenges to earn your first.</AppText>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
  errorBox: {
    marginBottom: Spacing.three,
    padding: Spacing.three,
    backgroundColor: '#FDEDED',
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  level: { marginBottom: Spacing.four, gap: Spacing.two },
  bar: {
    height: 8,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: Colors.light.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  badge: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.light.border,
    padding: Spacing.two,
  },
  locked: { backgroundColor: Colors.light.background },
});
