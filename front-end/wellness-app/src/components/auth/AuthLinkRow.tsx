import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  actionLabel: string;
  onActionPress?: () => void;
};

export function AuthLinkRow({ label, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>

      <AppText variant="link" onPress={onActionPress}>
        {actionLabel}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    flexWrap: 'wrap',
  },
  label: {
    color: Colors.light.textSecondary,
  },
});