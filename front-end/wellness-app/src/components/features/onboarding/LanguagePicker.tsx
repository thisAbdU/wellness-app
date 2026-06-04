import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Lang = 'en' | 'am';

type Props = {
  value: Lang;
  onChange: (lang: Lang) => void;
};

const OPTIONS: { id: Lang; label: string; preview: string }[] = [
  { id: 'en', label: 'English', preview: 'Good morning, Abel' },
  { id: 'am', label: 'አማርኛ', preview: 'እንደምን አደርክ፣ አቤል' },
];

export function LanguagePicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => onChange(opt.id)}
          >
            <AppText variant="bodyStrong">{opt.label}</AppText>
            <AppText variant="caption" style={styles.preview}>
              {opt.preview}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three },
  option: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundElement,
    gap: Spacing.two,
  },
  optionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  preview: { marginTop: Spacing.one },
});
