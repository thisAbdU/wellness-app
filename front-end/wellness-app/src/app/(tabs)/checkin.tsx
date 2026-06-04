import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function CheckinScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <SectionHeader
          title={i18n.t('checkin.title')}
          subtitle={i18n.t('checkin.subtitle')}
        />

        <AppCard style={styles.card}>
          <AppText variant="bodyStrong">{i18n.t('checkin.question1')}</AppText>
          <AppText variant="caption">{i18n.t('checkin.question1Hint')}</AppText>
          <View style={styles.row}>
            <AppButton label={i18n.t('checkin.low')} variant="secondary" />
            <AppButton label={i18n.t('checkin.ok')} variant="secondary" />
            <AppButton label={i18n.t('checkin.high')} variant="secondary" />
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="bodyStrong">{i18n.t('checkin.question2')}</AppText>
          <AppText variant="caption">{i18n.t('checkin.question2Hint')}</AppText>
          <AppButton label={i18n.t('checkin.saveCheckIn')} />
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
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
});