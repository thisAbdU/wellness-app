import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { Spacing } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
}: Props) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        <AppText variant="subtitle">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {actionLabel ? (
        <AppText variant="link" onPress={onActionPress}>
          {actionLabel}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  left: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
  },
});