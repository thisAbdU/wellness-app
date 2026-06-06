import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Localization from 'expo-localization';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppBadge } from '@/components/ui/AppBadge';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { WellnessScoreCard } from '@/components/features/wellness/WellnessScoreCard';
import { TodaySummary } from '@/components/features/wellness/TodaySummary';
import { QuickActionGrid } from '@/components/features/wellness/QuickActionGrid';
import { CoachInsightCard } from '@/components/CoachInsightCard';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/useDashboard';
import { useLocalization } from '@/hooks/useLocalization';

export default function HomeDashboard() {
  const { t } = useLocalization();
  const {
    profile,
    health,
    wellnessScore,
    wellnessStreak,
    calories,
    loading,
    error,
    refresh,
  } = useDashboard();

  let locale = Localization.getLocales()[0]?.languageTag ?? 'en';
  if (locale !== 'en' && locale !== 'am') locale = 'am';
  const today = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const steps = health.data.steps ?? 0;
  const sleepHours = health.data.sleepHours ?? 0;
  const sleepLabel =
    sleepHours > 0
      ? `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`
      : '—';
  const score = wellnessScore?.total_score ?? 0;

  if (loading && !wellnessScore && !profile) {
    return (
      <AppScreen>
        <ScreenHeader showMenu />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader showMenu />
      <AppText variant="overline">{today}</AppText>
      <AppText variant="title">
        {t('home.greeting')}, {firstName}
      </AppText>
      <AppText variant="caption" style={{ marginBottom: Spacing.three }}>
        {profile?.city ?? '—'}
      </AppText>

      {error ? (
        <TouchableOpacity style={styles.errorBanner} onPress={refresh}>
          <AppText variant="caption" color={Colors.light.error}>
            {error} — Tap to retry
          </AppText>
        </TouchableOpacity>
      ) : null}

      <WellnessScoreCard
        score={score}
        message={t('home.wellnessMessage')}
        onPress={() => navigate('/(app)/(tabs)/home/wellness-score')}
      />

      <TodaySummary
        metrics={[
          {
            icon: '👟',
            value: steps > 0 ? steps.toLocaleString() : '—',
            label: 'Steps',
            trend: health.hasAnyData ? 'From Health Connect' : 'No device data',
            trendUp: health.hasAnyData,
            accentBg: '#E8F4EE',
            accentColor: Colors.light.tint,
          },
          {
            icon: '🌙',
            value: sleepLabel,
            label: 'Sleep',
            trend: health.hasAnyData ? 'Last night' : 'No device data',
            trendUp: sleepHours > 0,
            accentBg: '#EEF0FA',
            accentColor: Colors.light.accentPurple,
          },
          {
            icon: '🔥',
            value: calories > 0 ? String(calories) : '—',
            label: 'Calories',
            trend: calories > 0 ? 'burned today' : 'Sync to update',
            trendUp: calories > 0,
            accentBg: '#FDF5E0',
            accentColor: Colors.light.warning,
          },
        ]}
      />

      <CoachInsightCard />

      <TouchableOpacity
        style={styles.streakRow}
        onPress={() => navigate('/(app)/(tabs)/home/streak')}
      >
        <AppBadge label={`🔥 ${wellnessStreak} day streak`} />
        <AppText variant="link">View milestones →</AppText>
      </TouchableOpacity>

      <QuickActionGrid
        actions={[
          {
            icon: '💧',
            title: 'Log water',
            subtitle: '250ml',
            bg: '#E8F4EE',
            onPress: () => {},
          },
          {
            icon: '🏃',
            title: 'Start workout',
            subtitle: 'Track now',
            bg: '#FAECE7',
            onPress: () => navigate('/(app)/(tabs)/activity'),
          },
          {
            icon: '🥗',
            title: 'Log meal',
            subtitle: "Today's plan",
            bg: '#FDF5E0',
            onPress: () => navigate('/(app)/(tabs)/nutrition'),
          },
        ]}
      />

      <AppText variant="overline" style={{ marginBottom: Spacing.two }}>
        Recent activity
      </AppText>
      {health.hasAnyData ? (
        [
          steps > 0 ? `Steps — ${steps.toLocaleString()}` : null,
          sleepHours > 0 ? `Sleep — ${sleepLabel}` : null,
          health.data.avgHeartRate
            ? `Resting HR — ${Math.round(health.data.avgHeartRate)} bpm`
            : null,
        ]
          .filter(Boolean)
          .map((entry) => (
            <View key={entry as string} style={styles.feedItem}>
              <AppText variant="bodyStrong">{entry}</AppText>
              <AppText variant="caption">Health Connect</AppText>
            </View>
          ))
      ) : (
        <View style={styles.feedItem}>
          <AppText variant="bodyStrong">No recent health data</AppText>
          <AppText variant="caption">Connect a device in Activity</AppText>
        </View>
      )}
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
  errorBanner: {
    marginBottom: Spacing.three,
    padding: Spacing.two,
    backgroundColor: '#FDEDED',
    borderRadius: 8,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  feedItem: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
  },
});
