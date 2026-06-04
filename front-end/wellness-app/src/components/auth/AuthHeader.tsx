import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function AuthHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <AppText variant="caption" style={styles.badgeText}>
          Wellness
        </AppText>
      </View>

      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>

      {subtitle ? (
        <AppText variant="caption" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    backgroundColor: Colors.light.primaryLight,
  },
  badgeText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  title: {
    color: Colors.light.text,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
});