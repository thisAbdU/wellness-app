import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AppCard } from '@/components/ui/AppCard';
import { Colors, Spacing } from '@/constants/theme';

const SAVED = [
  {
    date: 'Jun 3',
    q: 'How can I sleep better?',
    a: 'Try consistent bedtimes and evening walks.',
  },
];

export default function VoiceCoachHistory() {
  return (
    <AppScreen>
      <ScreenHeader title="Saved insights" showBack />
      {SAVED.map((item) => (
        <AppCard key={item.date} style={styles.card}>
          <AppText variant="overline">{item.date}</AppText>
          <AppText variant="bodyStrong">{item.q}</AppText>
          <AppText variant="caption">{item.a}</AppText>
          <Pressable style={styles.replay}>
            <AppText variant="link">▶ Replay audio</AppText>
          </Pressable>
        </AppCard>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.three, gap: Spacing.one },
  replay: { marginTop: Spacing.two },
});
