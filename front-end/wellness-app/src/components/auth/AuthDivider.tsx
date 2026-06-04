import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  label: string;
};

export function AuthDivider({ label }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />

      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>

      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },

  label: {
    color: Colors.light.textSecondary,
  },
});