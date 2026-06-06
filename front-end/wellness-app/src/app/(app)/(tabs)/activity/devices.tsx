import React from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useHealthConnect } from '@/hooks/useHealthConnect';

function statusLabel(status: string): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting…';
    case 'unavailable':
      return 'Unavailable';
    case 'error':
      return 'Error';
    default:
      return 'Checking…';
  }
}

export default function DeviceConnections() {
  const { status, source, hasAnyData, data } = useHealthConnect();
  const connected = status === 'connected';

  return (
    <AppScreen>
      <ScreenHeader title="Devices" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        On Android, Garmin, Fitbit, Xiaomi, and Samsung route through Health Connect.
      </AppText>
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <AppText variant="bodyStrong">Health Connect</AppText>
          <AppText
            variant="caption"
            color={connected ? Colors.light.primary : Colors.light.textSecondary}
          >
            {statusLabel(status)}
          </AppText>
        </View>
        <AppText variant="caption">
          Source: {source === 'health_connect' ? 'Health Connect' : 'None'}
        </AppText>
        {connected ? (
          <AppText variant="caption">
            Today: {data.steps?.toLocaleString() ?? ''} steps ·{' '}
            {data.workoutCount ?? 0} workouts
            {hasAnyData ? '' : ' (no data yet)'}
          </AppText>
        ) : (
          <AppText variant="caption" color={Colors.light.textSecondary}>
            Install Health Connect and grant permissions to sync wearable data.
          </AppText>
        )}
        {status === 'unavailable' && Platform.OS === 'android' ? (
          <AppButton
            label="Install Health Connect"
            onPress={() =>
              Linking.openURL(
                'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata',
              )
            }
          />
        ) : null}
      </AppCard>
      <AppCard style={styles.card}>
        <AppText variant="bodyStrong">Supported wearables</AppText>
        <AppText variant="caption">
          Garmin, Fitbit, Xiaomi, and Samsung Health sync via Health Connect on Android. Connect
          your device in the Health Connect app, then return here.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
