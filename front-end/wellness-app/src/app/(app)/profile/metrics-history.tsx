import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SimpleBarChart } from '@/components/ui/SimpleBarChart';
import { Spacing } from '@/constants/theme';

const WEIGHTS = [74, 73.5, 73, 72.5, 72, 72, 71.8];

export default function MetricsHistory() {
  return (
    <AppScreen>
      <ScreenHeader title="Weight history" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.three }}>
        Tap a point for logged value and date.
      </AppText>
      <SimpleBarChart data={WEIGHTS.map((w) => w * 10)} />
      <View style={{ marginTop: Spacing.four }}>
        <AppText variant="bodyStrong">Latest: 72 kg</AppText>
        <AppText variant="caption">Jun 3, 2026</AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({});
