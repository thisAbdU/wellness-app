import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SimpleBarChart } from '@/components/ui/SimpleBarChart';
import { Spacing } from '@/constants/theme';
import { WEEKLY_STEPS } from '@/constants/mockData';

export default function ActivityWeekly() {
  const router = useRouter();
  const [period, setPeriod] = useState('7D');

  return (
    <AppScreen>
      <ScreenHeader title="Trends" showBack />
      <SegmentedControl
        options={['7D', '30D', '3M']}
        selected={period}
        onSelect={setPeriod}
      />
      <AppCard style={styles.chartCard}>
        <AppText variant="bodyStrong">Steps per day</AppText>
        <SimpleBarChart
          data={WEEKLY_STEPS}
          labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
          onBarPress={() => {}}
        />
      </AppCard>
      <AppCard style={styles.chartCard}>
        <AppText variant="bodyStrong">Resting heart rate</AppText>
        <SimpleBarChart data={[68, 67, 70, 69, 68, 66, 68]} />
      </AppCard>
      <AppCard style={styles.chartCard}>
        <AppText variant="bodyStrong">Sleep duration (hrs)</AppText>
        <SimpleBarChart data={[6.5, 7, 7.2, 6.8, 7.5, 8, 7.2]} />
      </AppCard>
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
});
