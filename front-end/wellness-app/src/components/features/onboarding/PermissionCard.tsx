import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Spacing } from '@/constants/theme';

type Props = {
  icon: string;
  title: string;
  description: string;
  onAllow: () => void;
  allowed?: boolean;
};

export function PermissionCard({ icon, title, description, onAllow, allowed }: Props) {
  return (
    <AppCard style={styles.card}>
      <AppText style={styles.icon}>{icon}</AppText>
      <AppText variant="bodyStrong">{title}</AppText>
      <AppText variant="caption">{description}</AppText>
      <AppButton
        label={allowed ? 'Allowed' : 'Allow'}
        variant={allowed ? 'secondary' : 'primary'}
        onPress={onAllow}
        disabled={allowed}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  icon: { fontSize: 28 },
});
