import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { replace } from '@/lib/router';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your profile, health data, and saved insights. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
              replace('/(auth)/sign-in');
              Alert.alert('Account deleted', 'Your session has been ended. Contact support to complete data removal.');
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete account');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <AppScreen>
      <ScreenHeader title="Delete account" showBack />
      <AppText variant="body" style={{ marginBottom: Spacing.three }}>
        Deleting your account removes all personal data associated with{' '}
        <AppText variant="bodyStrong">{user?.email ?? 'your account'}</AppText>.
      </AppText>
      <AppText variant="caption" color={Colors.light.error} style={{ marginBottom: Spacing.four }}>
        Type DELETE to confirm.
      </AppText>
      <AuthTextField
        label="Confirmation"
        placeholder="DELETE"
        autoCapitalize="characters"
        value={confirmText}
        onChangeText={setConfirmText}
      />
      <AppButton
        label="Delete my account"
        onPress={handleDelete}
        loading={loading}
        disabled={confirmText !== 'DELETE'}
        style={{ marginTop: Spacing.three }}
      />
      <AppButton label="Cancel" variant="ghost" onPress={() => router.back()} style={{ marginTop: Spacing.two }} />
    </AppScreen>
  );
}
