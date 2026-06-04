import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors } from '@/constants/theme';

type Props = {
  progress: number;
  size?: number;
  label?: string;
  sublabel?: string;
  color?: string;
};

export function ProgressRing({
  progress,
  size = 120,
  label,
  sublabel,
  color = Colors.light.primary,
}: Props) {
  const clamped = Math.min(1, Math.max(0, progress));
  const stroke = 8;
  const inner = size - stroke * 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: Colors.light.primaryLight,
          },
        ]}
      />
      <View
        style={[
          styles.arc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
            borderColor: color,
            borderTopColor: clamped > 0.25 ? color : 'transparent',
            borderRightColor: clamped > 0.5 ? color : 'transparent',
            borderBottomColor: clamped > 0.75 ? color : 'transparent',
            borderLeftColor: clamped > 0 ? color : 'transparent',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      <View style={[styles.center, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        {label ? (
          <AppText variant="title" style={{ fontSize: size * 0.22, lineHeight: size * 0.26 }}>
            {label}
          </AppText>
        ) : null}
        {sublabel ? <AppText variant="caption">{sublabel}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  arc: { position: 'absolute' },
  center: {
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
