import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthLinkRow } from '@/components/auth/AuthLinkRow';
import { Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <AppScreen>
      <View style={styles.container}>
        <AuthHeader
          title={i18n.t('auth.resetPasswordTitle')}
          subtitle={i18n.t('auth.resetPasswordSubtitle')}
        />

        <AppCard style={styles.card}>
          <AuthTextField
            label={i18n.t('auth.email')}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />

          <AppButton
            label={i18n.t('auth.sendResetLink')}
            onPress={() => {
              // Supabase later
            }}
          />

          <AuthLinkRow
            label={i18n.t('auth.backTo')}
            actionLabel={i18n.t('auth.signIn')}
            onActionPress={() => router.back()}
          />
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  card: {
    gap: Spacing.four,
  },
});