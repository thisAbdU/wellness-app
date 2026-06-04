import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function AuthTextField({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>

      <TextInput
        placeholderTextColor={Colors.light.textSecondary}
        style={[styles.input, style, error ? styles.inputError : null]}
        {...props}
      />

      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    color: Colors.light.textSecondary,
  },
  input: {
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    color: Colors.light.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  error: {
    color: Colors.light.error,
  },
});