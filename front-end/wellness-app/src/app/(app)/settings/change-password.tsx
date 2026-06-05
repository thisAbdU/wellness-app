import React, { useState } from 'react';
import { Alert } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ChangePasswordScreen() {
  const { user, resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      Alert.alert('Success', 'Your password has been updated.');
      setPassword('');
      setConfirm('');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetLink = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      await resetPassword(user.email);
      Alert.alert('Check your inbox', `We sent a reset link to ${user.email}.`);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title="Change password" showBack />
      <AuthTextField
        label="New password"
        placeholder="At least 8 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <AuthTextField
        label="Confirm password"
        placeholder="Re-enter password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />
      <AppButton label="Update password" onPress={handleSave} loading={loading} style={{ marginTop: Spacing.three }} />
      <AppButton
        label="Send reset link instead"
        variant="secondary"
        onPress={handleResetLink}
        disabled={loading || !user?.email}
        style={{ marginTop: Spacing.two }}
      />
      <AppText variant="caption" style={{ marginTop: Spacing.three }}>
        Signed in as {user?.email ?? 'unknown'}
      </AppText>
    </AppScreen>
  );
}
