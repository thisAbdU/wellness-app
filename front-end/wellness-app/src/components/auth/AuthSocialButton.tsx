import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
};

export function AuthSocialButton({
  label,
  icon,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}>
      <View style={styles.icon}>
        {icon}
      </View>

      <AppText variant="bodyStrong">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundElement,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },

  pressed: {
    opacity: 0.8,
  },

  icon: {
    width: 24,
    alignItems: 'center',
  },
});