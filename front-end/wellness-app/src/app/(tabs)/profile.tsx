import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <View style={styles.container}>
        <SectionHeader
          title={i18n.t('profile.title')}
          subtitle={i18n.t('profile.subtitle')}
        />

        <AppCard style={styles.card}>
          <AppText variant="bodyStrong">Beleir</AppText>
          <AppText variant="caption">bel@example.com</AppText>
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="bodyStrong">{i18n.t('profile.language')}</AppText>
          <AppText variant="caption">{i18n.t('profile.languageHint')}</AppText>
          <AppButton label={i18n.t('profile.signOut')} variant="secondary" onPress={() => router.replace('/sign-in')} />
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  card: {
    gap: Spacing.three,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.backgroundElement,
  },
});