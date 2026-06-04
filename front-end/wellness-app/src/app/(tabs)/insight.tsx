import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function InsightScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <SectionHeader
          title={i18n.t('insight.title')}
          subtitle={i18n.t('insight.subtitle')}
        />

        <AppCard style={styles.card}>
          <AppText variant="subtitle">{i18n.t('insight.recentTrend')}</AppText>
          <Divider style={styles.divider} />
          <AppText variant="bodyStrong">{i18n.t('insight.sleepTrend')}</AppText>
          <AppText variant="caption">{i18n.t('insight.sleepTrendBody')}</AppText>
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="bodyStrong">{i18n.t('insight.activityTrend')}</AppText>
          <AppText variant="caption">{i18n.t('insight.activityTrendBody')}</AppText>
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
  divider: {
    marginVertical: Spacing.one,
  },
});