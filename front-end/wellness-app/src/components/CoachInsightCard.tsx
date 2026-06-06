import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { Colors, Spacing } from '@/constants/theme';
import { navigate } from '@/lib/router';
import { COACH_FALLBACK_MESSAGE, fetchCoachInsight } from '@/services/coachService';

export function CoachInsightCard() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const insight = await fetchCoachInsight('daily');
      setMessage(insight.insight);
      setUsingFallback(false);
    } catch {
      setMessage(COACH_FALLBACK_MESSAGE);
      setUsingFallback(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <AppText variant="overline" color={Colors.light.primary}>AI Coach</AppText>
        </View>
        {loading ? <ActivityIndicator size="small" color={Colors.light.primary} /> : null}
      </View>
      <AppText variant="bodyStrong">Today&apos;s insight</AppText>
      <AppText variant="caption">
        {loading ? 'Preparing your daily insight...' : message ?? COACH_FALLBACK_MESSAGE}
      </AppText>
      {usingFallback ? (
        <AppText variant="caption" color={Colors.light.warning}>
          Personalized coaching is temporarily unavailable.
        </AppText>
      ) : null}
      <View style={styles.actions}>
        <View style={styles.action}>
          <AppButton
            label="Refresh insight"
            variant="secondary"
            onPress={() => load(true)}
            loading={refreshing}
            disabled={loading}
          />
        </View>
        <View style={styles.action}>
          <AppButton
            label="Open coach"
            variant="ghost"
            onPress={() => navigate('/(app)/(tabs)/home/coach')}
          />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 20,
  },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  action: { flex: 1 },
});
