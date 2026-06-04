import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthSocialButton } from '@/components/auth/AuthSocialButton';
import { AuthLinkRow } from '@/components/auth/AuthLinkRow';
import { Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <AppScreen>
      <View style={styles.container}>
        <AuthHeader
          title={i18n.t('auth.signUpTitle')}
          subtitle={i18n.t('auth.signUpSubtitle')}
        />

        <AppCard style={styles.card}>
          <View style={styles.fields}>
            <AuthTextField
              label={i18n.t('auth.email')}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <AuthTextField
              label={i18n.t('auth.password')}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
            />

            <AuthTextField
              label={i18n.t('auth.confirmPassword')}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <AppButton
            label={i18n.t('auth.createAccount')}
            onPress={() => {
              // Supabase later
              router.replace('/home');
            }}
          />

          <AuthLinkRow
            label={i18n.t('auth.alreadyHaveAccount')}
            actionLabel={i18n.t('auth.signIn')}
            onActionPress={() => router.push('/sign-in')}
          />
        </AppCard>

        <AuthDivider label={i18n.t('auth.orContinueWith')} />

        <View style={styles.socialStack}>
          <AuthSocialButton
            label={i18n.t('auth.continueWithGoogle')}
            onPress={() => {}}
            icon={
              <View style={styles.googleIcon}>
                <AppText variant="bodyStrong" style={styles.googleIconText}>
                  G
                </AppText>
              </View>
            }
          />
        </View>
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
  fields: {
    gap: Spacing.three,
  },
  socialStack: {
    gap: Spacing.three,
  },
  googleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEFF0',
  },
  googleIconText: {
    color: '#4285F4',
    fontSize: 16,
  },
});