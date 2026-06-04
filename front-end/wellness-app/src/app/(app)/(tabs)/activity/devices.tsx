import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Spacing } from '@/constants/theme';
import { MOCK_DEVICES } from '@/constants/mockData';

export default function DeviceConnections() {
  const [devices, setDevices] = useState(MOCK_DEVICES);

  const toggle = (id: string) => {
    setDevices((d) =>
      d.map((dev) =>
        dev.id === id
          ? {
              ...dev,
              connected: !dev.connected,
              lastSync: !dev.connected ? 'Just now' : '—',
            }
          : dev,
      ),
    );
  };

  return (
    <AppScreen>
      <ScreenHeader title="Devices" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        On Android, Garmin, Fitbit, Xiaomi, and Samsung route through Health Connect.
      </AppText>
      {devices.map((d) => (
        <AppCard key={d.id} style={styles.card}>
          <View style={styles.row}>
            <AppText variant="bodyStrong">{d.name}</AppText>
            <AppText variant="caption">{d.connected ? 'Connected' : 'Not connected'}</AppText>
          </View>
          <AppText variant="caption">Last sync: {d.lastSync}</AppText>
          <AppButton
            label={d.connected ? 'Disconnect' : 'Connect'}
            variant={d.connected ? 'ghost' : 'primary'}
            onPress={() => toggle(d.id)}
          />
        </AppCard>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
