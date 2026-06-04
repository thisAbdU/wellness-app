import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { WellnessBackground } from '@/components/ui/WellnessBackground';
import { OnboardingSlideVisual } from '@/components/features/onboarding/OnboardingSlideVisual';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { completeOnboarding } from '@/lib/appState';
import { replace } from '@/lib/router';

const SLIDES = [
  {
    key: 'body' as const,
    step: 'Balance',
    title: 'Know how your body feels',
    body: 'Gently track steps, sleep, and heart rhythm — so each day starts with clarity, not guesswork.',
    accent: Colors.light.primary,
    accentSoft: Colors.light.primaryLight,
  },
  {
    key: 'ethiopia' as const,
    step: 'Culture',
    title: 'Wellness that understands you',
    body: 'Amharic and English, Orthodox fasting-aware meals, and leaderboards rooted in your community.',
    accent: '#3D8B63',
    accentSoft: '#E8F4EE',
  },
  {
    key: 'calm' as const,
    step: 'Peace',
    title: 'Healthy habits, even offline',
    body: 'Log check-ins and review insights without signal. Your progress waits patiently until you reconnect.',
    accent: '#5A7F6E',
    accentSoft: '#E6EFE7',
  },
  {
    key: 'coach' as const,
    step: 'Guidance',
    title: 'A calm coach in your pocket',
    body: 'Thoughtful tips and voice guidance — supportive, never overwhelming — in the language you prefer.',
    accent: Colors.light.primary,
    accentSoft: Colors.light.primaryLight,
  },
];

export default function OnboardingCarousel() {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const progress = (index + 1) / SLIDES.length;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true,
    }).start();
  }, [fade, index]);

  const next = () => {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    completeOnboarding();
    replace('/(auth)/sign-in');
  };

  const skip = () => {
    completeOnboarding();
    replace('/(auth)/sign-in');
  };

  return (
    <WellnessBackground variant="default">
      <View style={[styles.screen, { paddingTop: insets.top + Spacing.two, paddingBottom: insets.bottom + Spacing.two }]}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.leaf}>
              <AppText style={styles.leafText}>🌱</AppText>
            </View>
            <AppText variant="bodyStrong" color={Colors.light.primary}>
              Wellness
            </AppText>
          </View>
          {!isLast ? (
            <Pressable onPress={skip} hitSlop={12}>
              <AppText variant="link" style={styles.skip}>
                Skip
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <AppText variant="overline" style={styles.stepLabel}>
          {slide.step} · {index + 1} of {SLIDES.length}
        </AppText>

        <Animated.View style={[styles.content, { opacity: fade }]}>
          <OnboardingSlideVisual
            slide={slide.key}
            accent={slide.accent}
            accentSoft={slide.accentSoft}
          />
          <AppText variant="title" align="center" style={styles.title}>
            {slide.title}
          </AppText>
          <AppText variant="caption" align="center" style={styles.body}>
            {slide.body}
          </AppText>
        </Animated.View>

        <View style={styles.footer}>
          <AppText variant="caption" align="center" style={styles.footnote}>
            Small steps. Steady progress. A healthier you.
          </AppText>
          <AppButton
            label={isLast ? 'Begin your journey' : 'Continue'}
            onPress={next}
            style={styles.cta}
          />
        </View>
      </View>
    </WellnessBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  leaf: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafText: { fontSize: 18 },
  skip: { fontSize: 14 },
  skipPlaceholder: { width: 40 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    marginBottom: Spacing.two,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  stepLabel: {
    color: Colors.light.textSecondary,
    marginBottom: Spacing.five,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  title: {
    color: Colors.light.text,
    letterSpacing: -0.3,
    marginBottom: Spacing.three,
  },
  body: {
    lineHeight: 22,
    maxWidth: 340,
    alignSelf: 'center',
    color: Colors.light.textSecondary,
  },
  footer: {
    gap: Spacing.three,
  },
  footnote: {
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  cta: {
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
});
