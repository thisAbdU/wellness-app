import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  onCountdownComplete: () => void;
  disabled?: boolean;
  seconds?: number;
};

export function SosCountdownButton({
  onCountdownComplete,
  disabled = false,
  seconds = 5,
}: Props) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (remaining === null || remaining > 0) return;
    if (completedRef.current) return;

    completedRef.current = true;
    setRemaining(null);
    onCountdownComplete();
  }, [onCountdownComplete, remaining]);

  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((value) => (value ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const start = () => {
    completedRef.current = false;
    setRemaining(seconds);
  };

  const cancel = () => {
    completedRef.current = true;
    setRemaining(null);
  };

  const countingDown = remaining !== null;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={countingDown ? 'Cancel SOS countdown' : 'Start SOS countdown'}
        disabled={disabled}
        onPress={countingDown ? cancel : start}
        style={({ pressed }) => [
          styles.button,
          countingDown && styles.cancelButton,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text style={styles.label}>{countingDown ? remaining : 'SOS'}</Text>
        <Text style={styles.hint}>{countingDown ? 'Tap to cancel' : 'Tap for emergency help'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  button: {
    width: 220,
    height: 220,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.error,
    borderWidth: 10,
    borderColor: '#FAD7D7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#B42318',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '800',
  },
  hint: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.one,
  },
});
