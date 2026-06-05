import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { replace } from '@/lib/router';
import { AppText } from '@/components/ui/AppText';
import { WellnessBackground } from '@/components/ui/WellnessBackground';
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const { isLoading, getInitialRoute } = useAuth();
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
  }, [breathe, opacity, scale]);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      replace(getInitialRoute());
    }, 1800);
    return () => clearTimeout(timer);
  }, [isLoading, getInitialRoute]);

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
            {BRAND_NAME}
          </AppText>
          <AppText variant="caption" align="center" style={styles.tagline}>
            {BRAND_TAGLINE}
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
