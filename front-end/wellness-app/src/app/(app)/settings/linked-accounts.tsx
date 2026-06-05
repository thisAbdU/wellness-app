import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AppCard } from '@/components/ui/AppCard';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const PROVIDERS = [
  { id: 'google', label: 'Google', icon: 'G' },
  { id: 'apple', label: 'Apple', icon: '' },
  { id: 'phone', label: 'Phone', icon: '📱' },
];

export default function LinkedAccountsScreen() {
  const { user } = useAuth();
  const identities = user?.identities ?? [];
  const linked = new Set(identities.map((i) => i.provider));

  const handleLink = async (provider: string) => {
    if (provider === 'google') {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) Alert.alert('Error', error.message);
      return;
    }
    Alert.alert('Coming soon', `${provider} linking is not available yet.`);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Linked accounts" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        Manage sign-in methods for {user?.email ?? 'your account'}.
      </AppText>
      {PROVIDERS.map((p) => {
        const isLinked = linked.has(p.id) || (p.id === 'phone' && user?.phone);
        return (
          <AppCard key={p.id} style={styles.card}>
            <View style={styles.row}>
              <AppText variant="bodyStrong">{p.label}</AppText>
              <AppText variant="caption" color={isLinked ? Colors.light.primary : Colors.light.textSecondary}>
                {isLinked ? 'Connected' : 'Not connected'}
              </AppText>
            </View>
            {!isLinked ? (
              <AppButton label={`Link ${p.label}`} variant="secondary" onPress={() => handleLink(p.id)} />
            ) : null}
          </AppCard>
        );
      })}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
