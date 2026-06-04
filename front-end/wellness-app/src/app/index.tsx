import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { replace } from '@/lib/router';
import { AppText } from '@/components/ui/AppText';
import { WellnessBackground } from '@/components/ui/WellnessBackground';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { getInitialRoute } from '@/lib/appState';

export default function SplashScreen() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.04, duration: 2200, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      replace(getInitialRoute());
    }, 2200);

    return () => clearTimeout(timer);
  }, [breathe, opacity, router, scale]);

  return (
    <WellnessBackground variant="splash">
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity,
              transform: [{ scale: Animated.multiply(scale, breathe) }],
            },
          ]}
        >
          <View style={styles.logoRing}>
            <View style={styles.logo}>
              <AppText style={styles.logoText}>🌱</AppText>
            </View>
          </View>
          <AppText variant="subtitle" style={styles.brand}>
            Wellness
          </AppText>
          <AppText variant="caption" align="center" style={styles.tagline}>
            Your calm companion for a healthier daily rhythm
          </AppText>
        </Animated.View>
      </View>
    </WellnessBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  logoWrap: { alignItems: 'center', gap: Spacing.three, maxWidth: 300 },
  logoRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(47, 107, 78, 0.15)',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 36 },
  brand: { color: Colors.light.primary, letterSpacing: -0.2 },
  tagline: {
    color: Colors.light.textSecondary,
    lineHeight: 20,
    paddingHorizontal: Spacing.two,
  },
});
