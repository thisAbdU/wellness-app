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

export default function ChangeEmailScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const next = email.trim();
    if (!next || next === user?.email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: next });
      if (error) throw error;
      Alert.alert('Check your inbox', 'We sent a confirmation link to your new email address.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title="Change email" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        Current: {user?.email ?? 'Not set'}
      </AppText>
      <AuthTextField
        label="New email"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <AppButton label="Update email" onPress={handleSave} loading={loading} style={{ marginTop: Spacing.three }} />
    </AppScreen>
  );
}
