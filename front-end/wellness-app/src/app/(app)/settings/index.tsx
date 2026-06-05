import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SettingsRow } from '@/components/features/profile/SettingsRow';
import { Spacing } from '@/constants/theme';
import { navigate, replace } from '@/lib/router';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/hooks/useLocalization';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { locale } = useLocalization();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
            replace('/(auth)/sign-in');
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to sign out');
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const linkedProvider =
    user?.app_metadata?.provider === 'google'
      ? 'Google'
      : user?.phone
        ? 'Phone'
        : 'Email';

  return (
    <AppScreen>
      <ScreenHeader title="Settings" showBack />
      <AppText variant="overline" style={styles.section}>
        Account
      </AppText>
      <SettingsRow
        label="Change email"
        value={user?.email ?? undefined}
        onPress={() => navigate('/(app)/settings/change-email')}
      />
      <SettingsRow
        label="Change password"
        onPress={() => navigate('/(app)/settings/change-password')}
      />
      <SettingsRow
        label="Linked accounts"
        value={linkedProvider}
        onPress={() => navigate('/(app)/settings/linked-accounts')}
      />
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
      <SettingsRow
        label="Export my data"
        onPress={() => navigate('/(app)/settings/export-data')}
      />
      <SettingsRow
        label="Delete account"
        destructive
        onPress={() => navigate('/(app)/settings/delete-account')}
      />
      <AppText variant="overline" style={styles.section}>
        App
      </AppText>
      <SettingsRow
        label="Language"
        value={locale === 'am' ? 'አማርኛ' : 'English'}
        onPress={() => navigate('/(app)/language')}
      />
      <SettingsRow label="Units" value="Metric" />
      <SettingsRow
        label="Sync status"
        onPress={() => navigate('/(app)/settings/sync')}
      />
      <AppButton
        label="Sign out"
        variant="ghost"
        onPress={handleSignOut}
        loading={signingOut}
        style={{ marginTop: Spacing.five }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.four, marginBottom: Spacing.two },
});
