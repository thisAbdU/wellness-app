import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLocalization } from '@/hooks/useLocalization';
import type { Challenge } from '@/lib/api/types';
import { fetchChallengeProgress, getChallengeProgress } from '@/services/challengeService';

export function ChallengeProgressScreen({ challengeId }: { challengeId: string }) {
  const { locale } = useLocalization();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!challengeId) return;
    setLoading(true);
    setError(null);
    try {
      setChallenge(await fetchChallengeProgress(challengeId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load progress.');
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="Challenge progress" showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  if (!challenge) {
    return (
      <AppScreen>
        <ScreenHeader title="Challenge progress" showBack />
        <AppCard style={styles.errorCard}>
          <AppText variant="bodyStrong">Progress unavailable</AppText>
          <AppText variant="caption">{error ?? 'Challenge not found.'}</AppText>
          <AppButton label="Try again" variant="secondary" onPress={load} />
        </AppCard>
      </AppScreen>
    );
  }

  const title =
    locale === 'am' && challenge.title_am
      ? challenge.title_am
      : (challenge.title ?? 'Challenge');
  const progress = getChallengeProgress(challenge);
  const log = challenge.progress_json?.log ?? {};
  const dates = Object.keys(log).sort();

  return (
    <AppScreen>
      <ScreenHeader title={title} showBack />
      <View style={styles.statusRow}>
        <AppText variant="overline">Status</AppText>
        <View style={styles.statusBadge}>
          <AppText variant="bodyStrong" color={Colors.light.primary}>
            {challenge.status ?? 'active'}
          </AppText>
        </View>
      </View>
      <View style={styles.ring}>
        <ProgressRing
          progress={progress.ratio}
          size={150}
          label={`${progress.current}/${progress.required}`}
          sublabel="days completed"
        />
      </View>
      <AppCard style={styles.details}>
        <AppText variant="bodyStrong">Challenge details</AppText>
        <AppText variant="caption">
          {challenge.description ??
            `Reach ${challenge.target_value ?? ''} ${challenge.metric ?? ''} each day.`}
        </AppText>
        <AppText variant="caption">
          Goal: {challenge.target_value ?? 'Daily target'} {challenge.metric ?? ''}
        </AppText>
      </AppCard>
      <AppText variant="overline" style={styles.section}>Daily progress</AppText>
      <View style={styles.days}>
        {Array.from({ length: progress.required }).map((_, index) => {
          const completed = dates[index] ? Boolean(log[dates[index]]) : index < progress.current;
          return (
            <View key={dates[index] ?? index} style={styles.dayWrap}>
              <View style={[styles.day, completed && styles.dayComplete]} />
              <AppText variant="caption">{index + 1}</AppText>
            </View>
          );
        })}
      </View>
      <AppButton label="Refresh progress" variant="secondary" onPress={load} style={styles.refresh} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorCard: { gap: Spacing.three },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: {
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  ring: { alignItems: 'center', marginVertical: Spacing.four },
  details: { gap: Spacing.two },
  section: { marginTop: Spacing.four, marginBottom: Spacing.two },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  dayWrap: { alignItems: 'center', gap: Spacing.one },
  day: { width: 24, height: 24, borderRadius: 6, backgroundColor: Colors.light.border },
  dayComplete: { backgroundColor: Colors.light.primary },
  refresh: { marginTop: Spacing.four },
});
