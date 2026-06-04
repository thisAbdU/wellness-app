import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

type Metric = {
  icon: string;
  value: string;
  label: string;
  trend: string;
  trendUp: boolean;
  accentBg: string;
  accentColor: string;
};

type Props = { metrics: Metric[] };

export function TodaySummary({ metrics }: Props) {
  return (
    <View style={styles.grid}>
      {metrics.map((m) => (
        <View key={m.label} style={styles.tile}>
          <View style={[styles.icon, { backgroundColor: m.accentBg }]}>
            <AppText style={{ fontSize: 16 }}>{m.icon}</AppText>
          </View>
          <AppText variant="title" style={styles.val}>
            {m.value}
          </AppText>
          <AppText variant="overline">{m.label}</AppText>
          <AppText
            variant="caption"
            style={{ color: m.trendUp ? Colors.light.tint : Colors.light.accentOrange }}
          >
            {m.trendUp ? '↑' : '↓'} {m.trend}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const tileW = (width - Spacing.four * 2 - 10) / 2;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.three },
  tile: {
    width: tileW,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  val: { fontSize: 20, lineHeight: 24, marginBottom: 2 },
});
