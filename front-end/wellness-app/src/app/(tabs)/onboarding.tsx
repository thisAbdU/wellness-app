import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <AppText variant="caption" style={styles.badgeText}>
              Wellness
            </AppText>
          </View>

          <AppText variant="title">{i18n.t('onboarding.title')}</AppText>
          <AppText variant="caption">{i18n.t('onboarding.subtitle')}</AppText>
        </View>

        <AppCard style={styles.card}>
          <AppText variant="subtitle">{i18n.t('onboarding.cardTitle')}</AppText>
          <AppText variant="caption" style={styles.cardText}>
            {i18n.t('onboarding.cardBody')}
          </AppText>

          <View style={styles.actions}>
            <AppButton label={i18n.t('onboarding.getStarted')} onPress={() => router.push('/sign-in')} />
            <AppButton
              label={i18n.t('auth.signUpTitle')}
              variant="secondary"
              onPress={() => router.push('/sign-up')}
            />
          </View>
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.five,
    marginTop: Spacing.five,
  },
  hero: {
    gap: Spacing.two,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
  },
  badgeText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  card: {
    gap: Spacing.four,
  },
  cardText: {
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.three,
  },
});