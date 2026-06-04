import React, { useState } from 'react';
import { Switch, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';

const TYPES = [
  { id: 'streak', label: 'Streak reminders', time: '8:00 PM' },
  { id: 'health', label: 'Health alerts', time: 'Anytime' },
  { id: 'challenge', label: 'Challenge updates', time: 'Daily' },
  { id: 'summary', label: 'Weekly summary', time: 'Sunday 9 AM' },
];

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    streak: true,
    health: true,
    challenge: true,
    summary: false,
  });

  return (
    <AppScreen>
      <ScreenHeader title="Notifications" showBack />
      {TYPES.map((t) => (
        <View key={t.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong">{t.label}</AppText>
            <AppText variant="caption">{t.time}</AppText>
          </View>
          <Switch
            value={enabled[t.id]}
            onValueChange={(v) => setEnabled((e) => ({ ...e, [t.id]: v }))}
            trackColor={{ true: Colors.light.primary }}
          />
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.border,
  },
});
