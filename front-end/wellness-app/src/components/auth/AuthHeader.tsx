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
        <AppText style={styles.badgeIcon}>🌿</AppText>
        <AppText variant="caption" style={styles.badgeText}>
          Your BIRTU space
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
    marginBottom: Spacing.four,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 78, 0.1)',
  },
  badgeIcon: { fontSize: 14 },
  badgeText: {
    color: Colors.light.primary,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
});
