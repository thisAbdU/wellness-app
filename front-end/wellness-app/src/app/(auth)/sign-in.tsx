import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthSocialButton } from '@/components/auth/AuthSocialButton';
import { AuthLinkRow } from '@/components/auth/AuthLinkRow';
import { Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProfile, isProfileComplete } from '@/services/profileService';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      const profile = userId ? await fetchProfile(userId) : null;
      replace(isProfileComplete(profile) ? '/(app)/(tabs)/home' : '/(auth)/profile-setup/step-1');
    } catch (e) {
      Alert.alert('Sign in failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

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
        <AppButton label={i18n.t('auth.signIn')} onPress={handleSignIn} loading={loading} />
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
          onPress={() => Alert.alert('Google sign-in', 'Configure Google OAuth in Supabase dashboard.')}
          icon={
            <View style={styles.googleIcon}>
              <AppText variant="bodyStrong" style={styles.googleIconText}>G</AppText>
            </View>
          }
        />
        <AuthSocialButton
          label={i18n.t('auth.continueWithPhone')}
          onPress={() => navigate('/(auth)/phone')}
          icon={
            <View style={styles.phoneIcon}>
              <AppText variant="bodyStrong" style={styles.phoneIconText}>P</AppText>
            </View>
          }
        />
      </View>
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  fields: { gap: Spacing.three },
  socialStack: { gap: Spacing.two },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: { fontSize: 14 },
  phoneIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIconText: { fontSize: 12 },
});
