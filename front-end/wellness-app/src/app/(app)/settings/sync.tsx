import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Spacing } from '@/constants/theme';

const SYNC_TYPES = [
  { type: 'Steps', last: '2 min ago', pending: 0 },
  { type: 'Sleep', last: '1 hr ago', pending: 0 },
  { type: 'Heart rate', last: '2 min ago', pending: 0 },
  { type: 'Workouts', last: '3 hr ago', pending: 2 },
];

export default function SyncStatusScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Sync status" showBack />
      {SYNC_TYPES.map((s) => (
        <AppCard key={s.type} style={styles.card}>
          <View style={styles.row}>
            <AppText variant="bodyStrong">{s.type}</AppText>
            <AppText variant="caption">{s.last}</AppText>
          </View>
          {s.pending > 0 ? (
            <AppText variant="caption">{s.pending} items queued</AppText>
          ) : null}
        </AppCard>
      ))}
      <AppButton label="Sync now" onPress={() => {}} style={{ marginTop: Spacing.four }} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.two, gap: Spacing.one },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
