import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
};

export function SettingsRow({ label, value, onPress, destructive }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <AppText variant="bodyStrong" color={destructive ? Colors.light.error : undefined}>
        {label}
      </AppText>
      <View style={styles.right}>
        {value ? <AppText variant="caption">{value}</AppText> : null}
        {onPress ? <AppText variant="caption">›</AppText> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.border,
  },
  pressed: { opacity: 0.7 },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
