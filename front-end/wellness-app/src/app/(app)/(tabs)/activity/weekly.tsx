import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { navigate } from '@/lib/router';
import { api } from '@/lib/api';
import type { MonthlyAnalytics, WeeklyAnalytics } from '@/lib/api/types';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SimpleBarChart } from '@/components/ui/SimpleBarChart';
import { Colors, Spacing } from '@/constants/theme';

function dayLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en', { weekday: 'narrow' });
}

function buildChartData(
  period: string,
  weekly: WeeklyAnalytics,
  monthly: MonthlyAnalytics | null,
) {
  const sleepHrs = weekly.sleep_minutes.map((m) => Math.round((m / 60) * 10) / 10);
  const labels = weekly.days.map(dayLabel);

  if (period === '7D') {
    return { steps: weekly.steps, sleep: sleepHrs, active: weekly.active_minutes, labels };
  }

  const targetLen = 30;
  const padLen = Math.max(0, targetLen - weekly.steps.length);
  const avgSteps = Math.round(monthly?.average_steps ?? weekly.average_steps);
  const avgSleep = Math.round(((monthly?.average_sleep_minutes ?? weekly.average_sleep_minutes) / 60) * 10) / 10;
  const avgActive = Math.round(monthly?.average_active_minutes ?? 0);

  return {
    steps: [...Array(padLen).fill(avgSteps), ...weekly.steps],
    sleep: [...Array(padLen).fill(avgSleep), ...sleepHrs],
    active: [...Array(padLen).fill(avgActive), ...weekly.active_minutes],
    labels: [...Array(padLen).fill(''), ...labels],
  };
}

export default function ActivityWeekly() {
  const [period, setPeriod] = useState('7D');
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [monthly, setMonthly] = useState<MonthlyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [w, m] = await Promise.all([api.analytics.weekly(), api.analytics.monthly()]);
        if (!cancelled) {
          setWeekly(w);
          setMonthly(m);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load analytics');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!weekly) return null;
    return buildChartData(period, weekly, monthly);
  }, [period, weekly, monthly]);

  return (
    <AppScreen>
      <ScreenHeader title="Trends" showBack />
      <SegmentedControl
        options={['7D', '30D', '3M']}
        selected={period}
        onSelect={setPeriod}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      ) : error ? (
        <AppText variant="caption" color={Colors.light.error}>
          {error}
        </AppText>
      ) : chartData ? (
        <>
          <AppCard style={styles.chartCard}>
            <AppText variant="bodyStrong">Steps per day</AppText>
            <SimpleBarChart
              data={chartData.steps}
              labels={chartData.labels}
              onBarPress={(i) => {
                if (!weekly) return;
                const padLen =
                  period === '7D' ? 0 : Math.max(0, chartData.steps.length - weekly.days.length);
                const dayIndex = i - padLen;
                if (dayIndex >= 0 && dayIndex < weekly.days.length) {
                  navigate(`/(app)/(tabs)/activity/day/${weekly.days[dayIndex]}`);
                }
              }}
            />
          </AppCard>
          <AppCard style={styles.chartCard}>
            <AppText variant="bodyStrong">Active minutes</AppText>
            <SimpleBarChart data={chartData.active} labels={chartData.labels} />
          </AppCard>
          <AppCard style={styles.chartCard}>
            <AppText variant="bodyStrong">Sleep duration (hrs)</AppText>
            <SimpleBarChart data={chartData.sleep} labels={chartData.labels} />
          </AppCard>
        </>
      ) : null}
      <TouchableOpacity
        style={{ marginTop: Spacing.three }}
        onPress={() => navigate('/(app)/(tabs)/activity/monthly')}
      >
        <AppText variant="link">Monthly calendar view →</AppText>
      </TouchableOpacity>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  chartCard: { marginTop: Spacing.four, gap: Spacing.three },
  center: { marginTop: Spacing.six, alignItems: 'center' },
});
