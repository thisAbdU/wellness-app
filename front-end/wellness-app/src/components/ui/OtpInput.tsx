import React, { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
};

export function OtpInput({ length = 6, value, onChange }: Props) {
  const refs = useRef<(TextInput | null)[]>([]);
  const digits = value.padEnd(length, ' ').split('').slice(0, length);

  const setDigit = (index: number, char: string) => {
    const clean = char.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[index] = clean;
    const next = arr.join('').slice(0, length);
    onChange(next.replace(/\s/g, ''));
    if (clean && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <View style={styles.row}>
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            refs.current[i] = r;
          }}
          style={styles.box}
          keyboardType="number-pad"
          maxLength={1}
          value={d.trim()}
          onChangeText={(t) => setDigit(i, t)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace' && !d.trim() && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, justifyContent: 'center' },
  box: {
    width: 48,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundElement,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
});
