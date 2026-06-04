import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Localization from 'expo-localization';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppBadge } from '@/components/ui/AppBadge';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { WellnessScoreCard } from '@/components/features/wellness/WellnessScoreCard';
import { TodaySummary } from '@/components/features/wellness/TodaySummary';
import { QuickActionGrid } from '@/components/features/wellness/QuickActionGrid';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MOCK_USER } from '@/constants/mockData';
import { useHealthConnect } from '@/hooks/useHealthConnect';
import { i18n } from '@/i18n';

export default function HomeDashboard() {
  let locale = Localization.getLocales()[0]?.languageTag ?? 'en';
  if (locale !== 'en' && locale !== 'am') locale = 'am';
  const today = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const { data } = useHealthConnect();
  const steps = data.steps ?? 8432;
  const sleepHours = data.sleepHours ?? 7.2;
  const sleepLabel = `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`;

  return (
    <AppScreen>
      <ScreenHeader showMenu />
      <AppText variant="overline">{today}</AppText>
      <AppText variant="title">
        {i18n.t('home.greeting')}, {MOCK_USER.name.split(' ')[0]}
      </AppText>
      <AppText variant="caption" style={{ marginBottom: Spacing.three }}>
        {MOCK_USER.city}
      </AppText>

      <WellnessScoreCard
        score={MOCK_USER.wellnessScore}
        change={`↑ +4 ${i18n.t('home.fromLastWeek')}`}
        message={i18n.t('home.wellnessMessage')}
        onPress={() => navigate('/(app)/(tabs)/home/wellness-score')}
      />

      <TodaySummary
        metrics={[
          {
            icon: '👟',
            value: steps.toLocaleString(),
            label: 'Steps',
            trend: '12% vs yesterday',
            trendUp: true,
            accentBg: '#E8F4EE',
            accentColor: Colors.light.tint,
          },
          {
            icon: '🌙',
            value: sleepLabel,
            label: 'Sleep',
            trend: '18min more',
            trendUp: true,
            accentBg: '#EEF0FA',
            accentColor: Colors.light.accentPurple,
          },
          {
            icon: '🔥',
            value: '420',
            label: 'Calories',
            trend: 'on track',
            trendUp: true,
            accentBg: '#FDF5E0',
            accentColor: Colors.light.warning,
          },
        ]}
      />

      <TouchableOpacity
        style={styles.aiCard}
        onPress={() => navigate('/(app)/(tabs)/home/coach')}
      >
        <View style={styles.aiBadge}>
          <AppText style={styles.aiBadgeText}>✦ AI Coach</AppText>
        </View>
        <AppText variant="bodyStrong">Today&apos;s insight</AppText>
        <AppText variant="caption" style={{ marginTop: Spacing.one }}>
          Your sleep improved after workout days. Tap to expand and listen.
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.streakRow}
        onPress={() => navigate('/(app)/(tabs)/home/streak')}
      >
        <AppBadge label={`🔥 ${MOCK_USER.streak} day streak`} />
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
            subtitle: 'Today\'s plan',
            bg: '#FDF5E0',
            onPress: () => navigate('/(app)/(tabs)/nutrition'),
          },
        ]}
      />

      <AppText variant="overline" style={{ marginBottom: Spacing.two }}>
        Recent activity
      </AppText>
      {['Morning walk — 4,200 steps', 'Sleep — 7h 12m', 'Resting HR — 68 bpm'].map(
        (entry) => (
          <View key={entry} style={styles.feedItem}>
            <AppText variant="bodyStrong">{entry}</AppText>
            <AppText variant="caption">Health Connect</AppText>
          </View>
        ),
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  aiCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
    marginBottom: Spacing.three,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  aiBadgeText: { fontSize: 10, color: Colors.light.primary, letterSpacing: 0.6 },
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
