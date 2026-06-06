import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useContentLayout } from '@/hooks/useContentLayout';

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

const GRID_GAP = 10;

export function TodaySummary({ metrics }: Props) {
  const { contentWidth, columns } = useContentLayout();

  const tileWidth = useMemo(() => {
    if (columns === 1) return contentWidth;
    return (contentWidth - GRID_GAP * (columns - 1)) / columns;
  }, [columns, contentWidth]);

  return (
    <View style={styles.grid}>
      {metrics.map((m) => (
        <View key={m.label} style={[styles.tile, { width: tileWidth }]}>
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

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: Spacing.two,
    width: '100%',
  },
  tile: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  val: { fontSize: 18, lineHeight: 22, marginBottom: 2 },
});
