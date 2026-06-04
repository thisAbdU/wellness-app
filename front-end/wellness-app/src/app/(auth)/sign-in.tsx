import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';

import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { markAuthenticated } from '@/lib/appState';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthSocialButton } from '@/components/auth/AuthSocialButton';
import { AuthLinkRow } from '@/components/auth/AuthLinkRow';
import { Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthCardLayout>
      <AuthHeader
        title={i18n.t('auth.signInTitle')}
        subtitle={i18n.t('auth.signInSubtitle')}
      />
      <View style={styles.card}>
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
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <AppButton
            label={i18n.t('auth.signIn')}
            onPress={() => {
              markAuthenticated();
              replace('/(auth)/profile-setup/step-1');
            }}
          />

          <AuthLinkRow
            label={i18n.t('auth.forgotPassword')}
            actionLabel={i18n.t('auth.resetPassword')}
            onActionPress={() => navigate('/(auth)/reset-password')}
          />
          <AuthLinkRow
            label="New here?"
            actionLabel={i18n.t('auth.createAccount')}
            onActionPress={() => navigate('/(auth)/sign-up')}
          />
      </View>

      <AuthDivider label={i18n.t('auth.orContinueWith')} />

      <View style={styles.socialStack}>
          <AuthSocialButton
            label={i18n.t('auth.continueWithGoogle')}
            onPress={() => {
              // Supabase Google sign-in later
            }}
            icon={
              <View style={styles.googleIcon}>
                <AppText variant="bodyStrong" style={styles.googleIconText}>
                  G
                </AppText>
              </View>
            }
          />

          <AuthSocialButton
            label={i18n.t('auth.continueWithPhone')}
            onPress={() => navigate('/(auth)/phone')}
            icon={
              <View style={styles.phoneIcon}>
                <AppText variant="bodyStrong" style={styles.phoneIconText}>
                  P
                </AppText>
              </View>
            }
          />
      </View>
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
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
  phoneIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6EFE7',
  },
  phoneIconText: {
    color: '#2F6B4E',
    fontSize: 16,
  },
});