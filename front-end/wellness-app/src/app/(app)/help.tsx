import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';

const FAQ = [
  {
    q: 'How does Health Connect work?',
    a: 'On Android, Wellness reads steps, sleep, and workouts synced to Health Connect from apps like Samsung Health or Garmin.',
  },
  {
    q: 'አማርኛን እንዴት እቀይራለሁ?',
    a: 'Settings → Language → choose አማርኛ for a live UI preview.',
  },
];

export default function HelpScreen() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <AppScreen>
      <ScreenHeader title="Help & FAQ" showBack />
      {FAQ.map((item, i) => (
        <Pressable key={i} style={styles.item} onPress={() => setOpen(open === i ? null : i)}>
          <AppText variant="bodyStrong">{item.q}</AppText>
          {open === i ? <AppText variant="caption" style={styles.answer}>{item.a}</AppText> : null}
        </Pressable>
      ))}
      <AppButton
        label="Contact support"
        onPress={() => Linking.openURL('mailto:support@wellness.app?subject=Wellness%20Support')}
        style={{ marginTop: Spacing.five }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: Spacing.three,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.border,
    gap: Spacing.two,
  },
  answer: { lineHeight: 20 },
});
