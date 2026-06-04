import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'auth' | 'splash';
};

/** Soft organic shapes for a calm, nature-inspired wellness feel. */
export function WellnessBackground({ children, style, variant = 'default' }: Props) {
  const blobA =
    variant === 'splash' ? Colors.light.primaryLight : 'rgba(220, 233, 226, 0.85)';
  const blobB =
    variant === 'auth' ? 'rgba(126, 219, 166, 0.18)' : 'rgba(47, 107, 78, 0.08)';

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.blob, styles.blobTop, { backgroundColor: blobA }]} />
      <View style={[styles.blob, styles.blobRight, { backgroundColor: blobB }]} />
      <View style={[styles.blob, styles.blobBottom, { backgroundColor: blobA }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 280,
    height: 280,
    top: -80,
    left: -60,
  },
  blobRight: {
    width: 200,
    height: 200,
    top: '35%',
    right: -70,
  },
  blobBottom: {
    width: 320,
    height: 320,
    bottom: -120,
    left: '20%',
  },
});
