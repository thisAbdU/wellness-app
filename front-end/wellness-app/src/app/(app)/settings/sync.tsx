import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Spacing } from '@/constants/theme';
import { database } from '@/db/index';
import { flushSyncQueue } from '@/db/syncQueue';

const SYNC_TYPES = ['Steps', 'Sleep', 'Heart rate', 'Workouts'];

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function SyncStatusScreen() {
  const [pending, setPending] = useState(0);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const queue = await database.get('sync_queue').query().fetch();
    setPending(queue.length);
    if (queue.length > 0) {
      const oldest = queue.reduce((min, e) => {
        const t = (e._raw as unknown as { created_at: number }).created_at;
        return t < min ? t : min;
      }, Date.now());
      setLastSync(oldest);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await flushSyncQueue();
      setLastSync(Date.now());
      await refresh();
      Alert.alert('Sync complete', 'Queued changes have been uploaded.');
    } catch (e) {
      Alert.alert('Sync failed', e instanceof Error ? e.message : 'Could not sync');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title="Sync status" showBack />
      {SYNC_TYPES.map((type) => (
        <AppCard key={type} style={styles.card}>
          <View style={styles.row}>
            <AppText variant="bodyStrong">{type}</AppText>
            <AppText variant="caption">
              {lastSync ? formatRelative(lastSync) : 'Never'}
            </AppText>
          </View>
          {pending > 0 ? (
            <AppText variant="caption">{pending} items queued</AppText>
          ) : (
            <AppText variant="caption">Up to date</AppText>
          )}
        </AppCard>
      ))}
      <AppButton
        label="Sync now"
        onPress={handleSync}
        loading={syncing}
        style={{ marginTop: Spacing.four }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.two, gap: Spacing.one },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
