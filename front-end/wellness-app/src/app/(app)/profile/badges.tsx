import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';

const BADGES = [
  { id: '1', name: 'First week', earned: true },
  { id: '2', name: 'Step master', earned: true },
  { id: '3', name: 'Sleep champion', earned: false },
  { id: '4', name: 'Wellness pro', earned: false },
];

export default function BadgesScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Badges & levels" showBack />
      <View style={styles.level}>
        <AppText variant="caption">Level: Active</AppText>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: '45%' }]} />
        </View>
        <AppText variant="caption">Next: Athlete</AppText>
      </View>
      <View style={styles.grid}>
        {BADGES.map((b) => (
          <Pressable key={b.id} style={[styles.badge, !b.earned && styles.locked]}>
            <AppText style={{ fontSize: 32, opacity: b.earned ? 1 : 0.35 }}>
              {b.earned ? '🏅' : '🔒'}
            </AppText>
            <AppText variant="caption" align="center">
              {b.name}
            </AppText>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  level: { marginBottom: Spacing.four, gap: Spacing.two },
  bar: {
    height: 8,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: Colors.light.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  badge: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.light.border,
    padding: Spacing.two,
  },
  locked: { backgroundColor: Colors.light.background },
});
