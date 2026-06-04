import React, { useRef } from 'react';
import {
  StyleSheet, View, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import * as Localization from 'expo-localization';
import { router } from 'expo-router';
import { i18n } from '@/i18n';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useHealthConnect } from '@/hooks/useHealthConnect';

const { width } = Dimensions.get('window');

// ── Wellness score bar ────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: score / 100,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [score]);
  const barWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  return (
    <View style={styles.scoreBarTrack}>
      <Animated.View style={[styles.scoreBarFill, { width: barWidth }]} />
    </View>
  );
}

// ── Metric tile ───────────────────────────────────────────────────────────────
type MetricTileProps = {
  icon: string;
  value: string;
  label: string;
  trend: string;
  trendUp: boolean;
  accentBg: string;
  accentColor: string;
};

function MetricTile({ icon, value, label, trend, trendUp, accentBg, accentColor }: MetricTileProps) {
  return (
    <View style={styles.metricTile}>
      <View style={[styles.metricIcon, { backgroundColor: accentBg }]}>
        <AppText style={{ color: accentColor, fontSize: 16 }}>{icon}</AppText>
      </View>
      <AppText variant="title" style={styles.metricVal}>{value}</AppText>
      <AppText variant="overline">{label}</AppText>
      <AppText
        variant="caption"
        style={[styles.metricTrend, { color: trendUp ? Colors.light.tint : '#C4622D' }]}
      >
        {trendUp ? '↑' : '↓'} {trend}
      </AppText>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  let locale = Localization.getLocales()[0]?.languageTag ?? 'en';
  if (locale !== 'en' && locale !== 'am') locale = 'am';

  const today = new Intl.DateTimeFormat(locale, {
    weekday: 'long', month: 'short', day: 'numeric',
  }).format(new Date());

const { data, status, hasAnyData } = useHealthConnect();

  const steps      = data.steps       ?? 8432;
  const sleepHours = data.sleepHours  ?? 7.2;
  const heartRate  = data.avgHeartRate ?? 68;
  const workouts   = data.workoutCount ?? 1;

  const sleepLabel = `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`;

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View>
            <AppText variant="overline">{today}</AppText>
            <AppText variant="title">{i18n.t('home.greeting')}</AppText>
            <AppText variant="caption">{i18n.t('home.subtitle')}</AppText>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/profile')}
          >
            <AppText style={{ color: Colors.light.tint, fontSize: 18 }}>👤</AppText>
          </TouchableOpacity>
        </View>

        {/* ── Wellness score card ──────────────────────────────────────── */}
        <View style={styles.scoreCard}>
          <AppText variant="overline" style={styles.scoreLabelLight}>
            {i18n.t('home.wellnessScore')}
          </AppText>
          <View style={styles.scoreRow}>
            <AppText style={styles.scoreNumber}>82</AppText>
            <View style={styles.scoreMeta}>
              <AppText style={styles.scoreChange}>↑ +4 {i18n.t('home.fromLastWeek')}</AppText>
            </View>
          </View>
          <AppText style={styles.scoreMessage}>{i18n.t('home.wellnessMessage')}</AppText>
          <ScoreBar score={82} />
        </View>

        {/* ── Metrics grid ─────────────────────────────────────────────── */}
        <View style={styles.metricsGrid}>
          <MetricTile
            icon="👟" value={steps.toLocaleString()} label="Steps"
            trend="12% vs yesterday" trendUp
            accentBg="#E8F4EE" accentColor={Colors.light.tint}
          />
          <MetricTile
            icon="🌙" value={sleepLabel} label="Sleep"
            trend="18min more" trendUp
            accentBg="#EEF0FA" accentColor="#534AB7"
          />
          <MetricTile
            icon="❤️" value={`${heartRate} bpm`} label="Heart rate"
            trend="resting avg" trendUp={false}
            accentBg="#FAECE7" accentColor="#C4622D"
          />
          <MetricTile
            icon="🏃" value={`${workouts} today`} label="Workouts"
            trend="3 this week" trendUp
            accentBg="#FDF5E0" accentColor="#BA7517"
          />
        </View>
        {status === 'connected' && !hasAnyData && (
          <View style={styles.connectPrompt}>
            <AppText variant="bodyStrong">No data yet</AppText>
            <AppText variant="caption" style={{ marginTop: 4 }}>
              Open Samsung Health, Garmin Connect, or Fitbit and allow
              Health Connect sync to see your stats here.
            </AppText>
          </View>
        )}
        {/* ── AI insight ───────────────────────────────────────────────── */}
        <View style={styles.aiCard}>
          <View style={styles.aiBadge}>
            <AppText style={styles.aiBadgeText}>✦ AI insight</AppText>
          </View>
          <AppText variant="caption" style={styles.aiText}>
            Your sleep improved after workout days. Try scheduling evening walks for better recovery.
          </AppText>
        </View>

        {/* ── Quick actions ────────────────────────────────────────────── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/checkin')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F4EE' }]}>
              <AppText style={{ fontSize: 18 }}>📋</AppText>
            </View>
            <View>
              <AppText variant="bodyStrong">{i18n.t('home.checkIn')}</AppText>
              <AppText variant="caption">Log mood & energy</AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/insight')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FAECE7' }]}>
              <AppText style={{ fontSize: 18 }}>📊</AppText>
            </View>
            <View>
              <AppText variant="bodyStrong">{i18n.t('home.insights')}</AppText>
              <AppText variant="caption">AI analysis</AppText>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
   connectPrompt: {
    backgroundColor: '#FDF5E0',
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 0.5,
    borderColor: 'rgba(186,117,23,0.2)',
    marginBottom: Spacing.three,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.six,
    marginBottom: Spacing.four,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#E8F4EE',
    alignItems: 'center', justifyContent: 'center',
  },

  // Score card
  scoreCard: {
    backgroundColor: Colors.light.tint,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  scoreLabelLight: { color: 'rgba(255,255,255,0.65)', marginBottom: Spacing.two },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 4 },
  scoreNumber: { fontSize: 52, fontWeight: '500', color: '#fff', lineHeight: 56 },
  scoreMeta: { paddingBottom: 8 },
  scoreChange: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  scoreMessage: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: Spacing.three },
  scoreBarTrack: {
    height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scoreBarFill: {
    height: 4, borderRadius: 2,
    backgroundColor: '#7EDBA6',
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: Spacing.three,
  },
  metricTile: {
    width: (width - Spacing.four * 2 - 10) / 2,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  metricIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  metricVal: { fontSize: 20, lineHeight: 24, marginBottom: 2 },
  metricTrend: { fontSize: 11, marginTop: 6 },

  // AI card
  aiCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderLeftWidth: 2,
    borderLeftColor: Colors.light.tint,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.08)',
    borderRightColor: 'rgba(0,0,0,0.08)',
    borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: Spacing.four,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F4EE',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  aiBadgeText: { fontSize: 10, color: Colors.light.tint, letterSpacing: 0.6 },
  aiText: { lineHeight: 20 },

  // Actions
  actionsRow: {
    flexDirection: 'row', gap: 10,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  actionIcon: {
    width: 36, height: 36, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});