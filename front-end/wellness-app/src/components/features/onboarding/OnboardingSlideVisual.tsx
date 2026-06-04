import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius } from '@/constants/theme';

type SlideKey = 'body' | 'ethiopia' | 'calm' | 'coach';

type Props = {
  slide: SlideKey;
  accent: string;
  accentSoft: string;
};

const VISUALS: Record<SlideKey, { glyph: string; ring: string }> = {
  body: { glyph: '🌿', ring: '#E8F4EE' },
  ethiopia: { glyph: '☀️', ring: '#FDF5E0' },
  calm: { glyph: '🍃', ring: '#EEF0FA' },
  coach: { glyph: '✦', ring: '#DCE9E2' },
};

export function OnboardingSlideVisual({ slide, accent, accentSoft }: Props) {
  const v = VISUALS[slide];

  return (
    <View style={styles.wrap}>
      <View style={[styles.outerRing, { borderColor: accentSoft, backgroundColor: v.ring }]}>
        <View style={[styles.innerRing, { backgroundColor: accentSoft }]}>
          <View style={[styles.core, { backgroundColor: accent }]}>
            <AppText style={styles.glyph}>{v.glyph}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  outerRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 108,
    height: 108,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 44,
    color: '#fff',
    fontWeight: '600',
  },
});
