import React from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import * as Localization from 'expo-localization';
import { i18n } from '@/i18n';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Divider } from '@/components/ui/Divider';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useHealthConnect } from '@/hooks/useHealthConnect';

export default function HomeScreen() {
  let locale = Localization.getLocales()[0]?.languageTag ?? 'en';
  if (locale !== 'en' && locale !== 'am') locale = 'am';

  const today = new Intl.DateTimeFormat(locale, {
    weekday: 'long', month: 'short', day: 'numeric',
  }).format(new Date());

  const { status, data } = useHealthConnect();

  const isLoading = status === 'connecting';
  const isConnected = status === 'connected';

  // Fallback values for iOS / unavailable
  const steps       = data.steps       ?? "-";
  const sleepHours  = data.sleepHours  ?? 0;
  const heartRate   = data.avgHeartRate ?? "-";
  const workouts    = data.workoutCount ?? "-";

  const sleepLabel = `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`;

  return (
    <AppScreen>
      <View style={styles.header}>
        <AppText variant="overline">{today}</AppText>
        <AppText variant="title">{i18n.t('home.greeting')}</AppText>
        <AppText variant="caption">{i18n.t('home.subtitle')}</AppText>
      </View>

      <AppCard style={styles.heroCard}>
        <AppText variant="overline">{i18n.t('home.wellnessScore')}</AppText>
        <AppText variant="title" style={styles.score}>82</AppText>
        <AppText variant="caption">{i18n.t('home.wellnessMessage')}</AppText>
      </AppCard>

      <SectionHeader
        title={i18n.t('home.quickActions')}
        subtitle={i18n.t('home.quickActionsSubtitle')}
      />
      <View style={styles.actionsRow}>
        <View style={styles.actionItem}>
          <AppButton label={i18n.t('home.checkIn')} />
        </View>
        <View style={styles.actionItem}>
          <AppButton label={i18n.t('home.insights')} variant="secondary" />
        </View>
      </View>

      <AppCard style={styles.summaryCard}>
        {/* ── Health Connect status badge ─────────────────────────────── */}
        <View style={styles.statusRow}>
          <SectionHeader
            title={i18n.t('home.todaySummary')}
            actionLabel={i18n.t('common.viewAll')}
          />
          {Platform.OS === 'android' && (
            <View style={[
              styles.badge,
              isConnected  && styles.badgeConnected,
              isLoading    && styles.badgeLoading,
              status === 'error' || status === 'unavailable' ? styles.badgeError : null,
            ]}>
              {isLoading
                ? <ActivityIndicator size="small" color={Colors.light.tint} />
                : <AppText variant="caption" style={styles.badgeText}>
                    {isConnected ? '● Health Connect' : status === 'unavailable' ? 'No Health Connect' : 'Sync error'}
                  </AppText>
              }
            </View>
          )}
        </View>

        <Divider style={{ marginVertical: Spacing.three }} />

        {/* ── 4 metrics ──────────────────────────────────────────────── */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <AppText variant="overline">Steps</AppText>
            <AppText variant="bodyStrong">{steps.toLocaleString()}</AppText>
          </View>
          <View style={styles.metricItem}>
            <AppText variant="overline">Sleep</AppText>
            <AppText variant="bodyStrong">{sleepLabel}</AppText>
          </View>
          <View style={styles.metricItem}>
            <AppText variant="overline">Heart Rate</AppText>
            <AppText variant="bodyStrong">{heartRate} bpm</AppText>
          </View>
          <View style={styles.metricItem}>
            <AppText variant="overline">Workouts</AppText>
            <AppText variant="bodyStrong">{workouts} today</AppText>
          </View>
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
    marginTop: Spacing.six,
    gap: 6,
  },
  heroCard: {
    marginBottom: Spacing.four,
    borderRadius: Radius.xl,
    backgroundColor: Colors.light.backgroundElement,
  },
  score: {
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  actionItem: { flex: 1 },
  summaryCard: { marginTop: Spacing.one },

  // ── Health Connect additions ───────────────────────────────────────────────
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundElement,
  },
  badgeConnected: { backgroundColor: '#E8F4EE' },   // light forest green tint
  badgeLoading:   { backgroundColor: Colors.light.backgroundElement },
  badgeError:     { backgroundColor: '#FDF0EC' },   // light terracotta tint
  badgeText: {
    fontSize: 11,
    color: Colors.light.tint,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metricItem: {
    width: '45%',
    gap: 2,
  },
});