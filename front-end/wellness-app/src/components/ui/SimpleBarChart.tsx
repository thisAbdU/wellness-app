import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  data: number[];
  labels?: string[];
  maxValue?: number;
  onBarPress?: (index: number) => void;
};

export function SimpleBarChart({ data, labels, maxValue, onBarPress }: Props) {
  const max = maxValue ?? Math.max(...data, 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        {data.map((v, i) => {
          const h = Math.max(8, (v / max) * 100);
          return (
            <Pressable key={i} style={styles.col} onPress={() => onBarPress?.(i)}>
              <View style={[styles.bar, { height: `${h}%` }]} />
              {labels?.[i] ? (
                <AppText variant="caption" style={styles.label}>
                  {labels[i]}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 140 },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  col: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: {
    width: '100%',
    maxWidth: 32,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.sm,
    minHeight: 8,
  },
  label: { marginTop: Spacing.one, fontSize: 10 },
});
