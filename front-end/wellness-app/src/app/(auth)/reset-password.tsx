import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthLinkRow } from '@/components/auth/AuthLinkRow';
import { Colors, Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <AuthCardLayout>
      <AuthHeader
        title={i18n.t('auth.resetPasswordTitle')}
        subtitle={
          sent ? 'Check your inbox' : i18n.t('auth.resetPasswordSubtitle')
        }
      />
      {sent ? (
        <View style={styles.confirm}>
          <AppText style={{ fontSize: 40 }}>✉️</AppText>
          <AppText variant="body" align="center">
            We sent a reset link to {email || 'your email'}.
          </AppText>
          <AppButton label="Back to sign in" onPress={() => router.back()} />
        </View>
      ) : (
        <>
          <AuthTextField
            label={i18n.t('auth.email')}
            placeholder="name@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <AppButton label={i18n.t('auth.sendResetLink')} onPress={() => setSent(true)} />
          <AuthLinkRow
            label={i18n.t('auth.backTo')}
            actionLabel={i18n.t('auth.signIn')}
            onActionPress={() => router.back()}
          />
        </>
      )}
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  confirm: { alignItems: 'center', gap: Spacing.four, paddingVertical: Spacing.four },
});
