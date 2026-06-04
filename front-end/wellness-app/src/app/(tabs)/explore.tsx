import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function ExploreScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <SectionHeader
          title={i18n.t('explore.title')}
          subtitle={i18n.t('explore.subtitle')}
        />

        <AppCard style={styles.card}>
          <AppText variant="bodyStrong">{i18n.t('explore.todayChallenge')}</AppText>
          <AppText variant="caption">{i18n.t('explore.todayChallengeBody')}</AppText>
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="bodyStrong">{i18n.t('explore.recommended')}</AppText>
          <AppText variant="caption">{i18n.t('explore.recommendedBody')}</AppText>
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