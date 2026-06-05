import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Challenge } from '@/lib/api/types';
import { fetchChallengeTemplates } from '@/services/profileService';
import { useLocalization } from '@/hooks/useLocalization';

function metricIcon(metric?: string): string {
  switch (metric) {
    case 'steps':
      return '👟';
    case 'sleep_hrs':
      return '🌙';
    case 'workout_days':
      return '💪';
    default:
      return '🎯';
  }
}

function challengeTitle(c: Challenge, locale: string): string {
  return locale === 'am' && c.title_am ? c.title_am : (c.title ?? 'Challenge');
}

export default function ChallengesBrowse() {
  const { locale } = useLocalization();
  const [active, setActive] = useState<Challenge[]>([]);
  const [available, setAvailable] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [activeList, templates] = await Promise.all([
        api.challenges.active(),
        fetchChallengeTemplates(),
      ]);
      setActive(activeList);
      const activeIds = new Set(
        activeList.map((c) => String(c.challenge_id ?? c.id)),
      );
      setAvailable(templates.filter((t) => !activeIds.has(String(t.id))));
    } catch {
      setActive([]);
      setAvailable([]);
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
      <AppText variant="overline" style={styles.section}>
        Active
      </AppText>
      {active.length === 0 ? (
        <AppText variant="caption">No active challenges — pick one below.</AppText>
      ) : (
        active.map((c) => {
          const id = String(c.challenge_id ?? c.id);
          const required = c.progress_json?.required_days ?? c.duration_days ?? 1;
          const qualifying = c.progress_json?.qualifying_days ?? c.progress ?? 0;
          const progress = required > 0 ? qualifying / required : 0;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => navigate(`/(app)/(tabs)/challenges/${id}`)}
            >
              <ChallengeCard
                icon={metricIcon(c.metric)}
                title={challengeTitle(c, locale)}
                duration={`${required} days`}
                metric={c.metric ?? ''}
                progress={progress}
                active
              />
            </TouchableOpacity>
          );
        })
      )}
      <AppText variant="overline" style={styles.section}>
        Available
      </AppText>
      {available.map((t) => (
        <TouchableOpacity
          key={String(t.id)}
          onPress={() => navigate(`/(app)/(tabs)/challenges/start/${t.id}`)}
        >
          <ChallengeCard
            icon={metricIcon(t.metric as string)}
            title={
              locale === 'am' && t.title_am
                ? String(t.title_am)
                : String(t.title ?? 'Challenge')
            }
            duration={`${t.duration_days} days`}
            metric={String(t.metric ?? '')}
          />
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
          <View style={[styles.barFill, { width: `${Math.min(progress, 1) * 100}%` }]} />
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
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
