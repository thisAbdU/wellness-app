import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Localization from 'expo-localization';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
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
  const [refreshing, setRefreshing] = useState(false);
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
  const initial = (profile?.full_name?.[0] ?? firstName[0] ?? 'W').toUpperCase();
  const steps = health.data.steps ?? 0;
  const sleepHours = health.data.sleepHours ?? 0;
  const sleepLabel =
    sleepHours > 0
      ? `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`
      : '—';
  const score = wellnessScore?.total_score ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

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
    <AppScreen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.light.primary}
        />
      }
    >
      <ScreenHeader showMenu />

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <AppText variant="title" color={Colors.light.primary}>
            {initial}
          </AppText>
        </View>
        <View style={styles.heroText}>
          <AppText variant="overline">{today}</AppText>
          <AppText variant="title">
            {t('home.greeting')}, {firstName}
          </AppText>
          <AppText variant="caption" color={Colors.light.textSecondary}>
            {profile?.city ?? 'Addis Ababa'} · BIRTU dashboard
          </AppText>
        </View>
      </View>

      {error ? (
        <TouchableOpacity style={styles.errorBanner} onPress={refresh}>
          <AppText variant="caption" color={Colors.light.error}>
            {error} — Tap to retry
          </AppText>
        </TouchableOpacity>
      ) : null}

      {!health.hasAnyData ? (
        <View style={styles.connectCard}>
          <AppText variant="bodyStrong">Connect your health data</AppText>
          <AppText variant="caption" style={styles.connectCopy}>
            Sync steps, sleep, and calories from Activity to unlock your BIRTU score and AI
            insights.
          </AppText>
          <AppButton
            label="Go to Activity"
            variant="secondary"
            onPress={() => navigate('/(app)/(tabs)/activity')}
          />
        </View>
      ) : null}

      <WellnessScoreCard
        score={score}
        message={t('home.wellnessMessage')}
        onPress={() => navigate('/(app)/(tabs)/home/wellness-score')}
      />

      {wellnessScore ? (
        <View style={styles.scoreBreakdown}>
          <ScorePill label="Activity" value={wellnessScore.activity_score} max={30} />
          <ScorePill label="Sleep" value={wellnessScore.sleep_score} max={30} />
          <ScorePill label="Recovery" value={wellnessScore.recovery_score} max={20} />
          <ScorePill label="Consistency" value={wellnessScore.consistency_score} max={20} />
        </View>
      ) : null}

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

      <AppText variant="overline" style={styles.sectionLabel}>
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
          <AppText variant="caption">Connect a device in Activity to populate this feed.</AppText>
        </View>
      )}
    </AppScreen>
  );
}

function ScorePill({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <View style={styles.pill}>
      <AppText variant="caption">{label}</AppText>
      <View style={styles.pillTrack}>
        <View style={[styles.pillFill, { width: `${pct}%` }]} />
      </View>
      <AppText variant="caption">
        {value}/{max}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
  hero: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, gap: 2 },
  connectCard: {
    width: '100%',
    backgroundColor: '#FDF5E0',
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 0.5,
    borderColor: '#E8D4A8',
    gap: Spacing.two,
  },
  connectCopy: { color: Colors.light.textSecondary, lineHeight: 20 },
  scoreBreakdown: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  pill: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    padding: Spacing.two,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
    gap: 6,
  },
  pillTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    overflow: 'hidden',
  },
  pillFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  errorBanner: {
    marginBottom: Spacing.three,
    padding: Spacing.two,
    backgroundColor: '#FDEDED',
    borderRadius: 8,
  },
  streakRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  sectionLabel: { marginBottom: Spacing.one, marginTop: Spacing.two },
  feedItem: {
    width: '100%',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    padding: Spacing.two,
    marginBottom: Spacing.one,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
});
