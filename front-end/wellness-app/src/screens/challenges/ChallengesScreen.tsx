import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLocalization } from '@/hooks/useLocalization';
import type { Challenge } from '@/lib/api/types';
import { navigate } from '@/lib/router';
import {
  fetchChallengeDashboard,
  getChallengeId,
  getChallengeProgress,
  startChallenge,
  type ChallengeDashboard,
  type ChallengeTemplate,
} from '@/services/challengeService';

const EMPTY_DASHBOARD: ChallengeDashboard = { active: [], completed: [], available: [] };

function localizedTitle(
  challenge: Pick<Challenge, 'title' | 'title_am'> | ChallengeTemplate,
  locale: string,
): string {
  return locale === 'am' && challenge.title_am
    ? challenge.title_am
    : (challenge.title ?? 'Challenge');
}

export function ChallengesScreen() {
  const { locale } = useLocalization();
  const [dashboard, setDashboard] = useState<ChallengeDashboard>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await fetchChallengeDashboard());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load challenges.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStart = async (template: ChallengeTemplate) => {
    setStartingId(template.id);
    try {
      const challenge = await startChallenge(template.id);
      navigate(`/(app)/(tabs)/challenges/${getChallengeId(challenge, template.id)}`);
    } catch (startError) {
      Alert.alert(
        'Could not start challenge',
        startError instanceof Error ? startError.message : 'Please try again.',
      );
    } finally {
      setStartingId(null);
    }
  };

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="Challenges" showMenu />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Challenges" showMenu />
      {error ? (
        <AppCard style={styles.errorCard}>
          <AppText variant="bodyStrong">Challenges unavailable</AppText>
          <AppText variant="caption">{error}</AppText>
          <AppButton label="Try again" variant="secondary" onPress={load} />
        </AppCard>
      ) : null}

      <SectionTitle label="Active challenges" />
      {dashboard.active.length === 0 ? (
        <AppText variant="caption">No active challenges. Start one below.</AppText>
      ) : (
        dashboard.active.map((challenge) => {
          const id = getChallengeId(challenge);
          return (
            <ChallengeCard
              key={id}
              title={localizedTitle(challenge, locale)}
              description={challenge.description}
              metric={challenge.metric}
              status={challenge.status ?? 'active'}
              progress={getChallengeProgress(challenge)}
              onPress={() => navigate(`/(app)/(tabs)/challenges/${id}`)}
            />
          );
        })
      )}

      <SectionTitle label="Available challenges" />
      {dashboard.available.length === 0 ? (
        <AppText variant="caption">No additional challenges are available right now.</AppText>
      ) : (
        dashboard.available.map((template) => (
          <ChallengeCard
            key={template.id}
            title={localizedTitle(template, locale)}
            description={template.description}
            metric={template.metric}
            status="available"
            durationDays={template.duration_days}
            action={
              <AppButton
                label="Start"
                onPress={() => handleStart(template)}
                loading={startingId === template.id}
                disabled={startingId !== null}
              />
            }
          />
        ))
      )}

      {dashboard.completed.length > 0 ? (
        <>
          <SectionTitle label="Completed" />
          {dashboard.completed.map((challenge) => {
            const id = getChallengeId(challenge);
            return (
              <ChallengeCard
                key={id}
                title={localizedTitle(challenge, locale)}
                description={challenge.description}
                metric={challenge.metric}
                status="completed"
                progress={getChallengeProgress(challenge)}
                onPress={() => navigate(`/(app)/(tabs)/challenges/${id}`)}
              />
            );
          })}
        </>
      ) : null}
    </AppScreen>
  );
}

function SectionTitle({ label }: { label: string }) {
  return <AppText variant="overline" style={styles.section}>{label}</AppText>;
}

function ChallengeCard({
  title,
  description,
  metric,
  status,
  durationDays,
  progress,
  action,
  onPress,
}: {
  title: string;
  description?: string;
  metric?: string;
  status: string;
  durationDays?: number;
  progress?: ReturnType<typeof getChallengeProgress>;
  action?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <AppCard style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <AppText variant="bodyStrong" style={styles.cardTitle}>{title}</AppText>
        <View style={styles.statusBadge}>
          <AppText variant="overline" color={Colors.light.primary}>{status}</AppText>
        </View>
      </View>
      {description ? <AppText variant="caption">{description}</AppText> : null}
      <AppText variant="caption">
        {[durationDays ? `${durationDays} days` : null, metric].filter(Boolean).join(' · ')}
      </AppText>
      {progress ? (
        <>
          <View style={styles.progressRow}>
            <AppText variant="caption">Progress</AppText>
            <AppText variant="caption">{progress.current}/{progress.required} days</AppText>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${progress.ratio * 100}%` }]} />
          </View>
        </>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: Spacing.four, marginBottom: Spacing.two },
  card: { marginBottom: Spacing.three, gap: Spacing.two },
  errorCard: { gap: Spacing.two, marginBottom: Spacing.three },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  cardTitle: { flex: 1 },
  statusBadge: {
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barTrack: {
    height: 7,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: Colors.light.primary },
  action: { marginTop: Spacing.one },
});
