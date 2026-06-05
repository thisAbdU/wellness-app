import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Switch, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

const TYPES = [
  { id: 'streak', label: 'Streak reminders', time: '8:00 PM' },
  { id: 'health', label: 'Health alerts', time: 'Anytime' },
  { id: 'challenge', label: 'Challenge updates', time: 'Daily' },
  { id: 'summary', label: 'Weekly summary', time: 'Sunday 9 AM' },
];

const DEFAULT_PREFS: Record<string, boolean> = {
  streak: true,
  health: true,
  challenge: true,
  summary: false,
};

async function registerFcmToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  const token = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  return token.data;
}

export default function NotificationSettings() {
  const { profile, updateProfile } = useAuth();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.notification_prefs) {
      setEnabled({ ...DEFAULT_PREFS, ...profile.notification_prefs });
    }
  }, [profile?.notification_prefs]);

  const persist = useCallback(
    async (next: Record<string, boolean>) => {
      setSaving(true);
      try {
        let fcmToken = profile?.fcm_token;
        if (!fcmToken) {
          fcmToken = (await registerFcmToken()) ?? undefined;
        }
        await updateProfile({
          notification_prefs: next,
          ...(fcmToken ? { fcm_token: fcmToken } : {}),
        });
      } catch (e) {
        Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save preferences');
      } finally {
        setSaving(false);
      }
    },
    [profile?.fcm_token, updateProfile],
  );

  const toggle = (id: string, value: boolean) => {
    const next = { ...enabled, [id]: value };
    setEnabled(next);
    persist(next);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Notifications" showBack />
      {saving ? (
        <AppText variant="caption" style={{ marginBottom: Spacing.two }}>
          Saving…
        </AppText>
      ) : null}
      {TYPES.map((t) => (
        <View key={t.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong">{t.label}</AppText>
            <AppText variant="caption">{t.time}</AppText>
          </View>
          <Switch
            value={enabled[t.id] ?? false}
            onValueChange={(v) => toggle(t.id, v)}
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
