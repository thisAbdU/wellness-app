import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SettingsRow } from '@/components/features/profile/SettingsRow';
import { Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <ScreenHeader title="Settings" showBack />
      <AppText variant="overline" style={styles.section}>
        Account
      </AppText>
      <SettingsRow label="Change email" onPress={() => {}} />
      <SettingsRow label="Change password" onPress={() => {}} />
      <SettingsRow label="Linked accounts" value="Google" onPress={() => {}} />
      <AppText variant="overline" style={styles.section}>
        Notifications
      </AppText>
      <SettingsRow
        label="Notification preferences"
        onPress={() => navigate('/(app)/settings/notifications')}
      />
      <AppText variant="overline" style={styles.section}>
        Data & privacy
      </AppText>
      <SettingsRow label="Export my data" onPress={() => {}} />
      <SettingsRow label="Delete account" destructive onPress={() => {}} />
      <AppText variant="overline" style={styles.section}>
        App
      </AppText>
      <SettingsRow label="Language" value="English" onPress={() => navigate('/(app)/language')} />
      <SettingsRow label="Units" value="Metric" />
      <SettingsRow
        label="Sync status"
        onPress={() => navigate('/(app)/settings/sync')}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.four, marginBottom: Spacing.two },
});
