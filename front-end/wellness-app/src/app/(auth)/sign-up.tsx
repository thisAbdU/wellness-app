import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthLinkRow } from '@/components/auth/AuthLinkRow';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { i18n } from '@/i18n';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password || !confirmPassword) {
      Alert.alert('Missing information', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Password must be at least 8 characters.');
      return;
    }
    if (!terms) {
      Alert.alert('Terms required', 'Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(normalizedEmail, password);
      if (result.requiresEmailConfirmation) {
        Alert.alert(
          'Check your email',
          'Account created successfully. Confirm your email, then sign in.',
          [{ text: 'Go to sign in', onPress: () => replace('/(auth)/sign-in') }],
        );
      } else {
        replace('/(auth)/profile-setup/step-1');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong while creating your account.';
      console.error('Unexpected signup error:', e);
      Alert.alert('Sign up failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout>
      <AuthHeader title={i18n.t('auth.signUpTitle')} subtitle={i18n.t('auth.signUpSubtitle')} />
      <View style={styles.fields}>
        <AuthTextField
          label={i18n.t('auth.email')}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <AuthTextField
          label={i18n.t('auth.password')}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <AuthTextField
          label={i18n.t('auth.confirmPassword')}
          placeholder="••••••••"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      <Pressable style={styles.terms} onPress={() => setTerms(!terms)}>
        <View style={[styles.checkbox, terms && styles.checkboxOn]}>
          {terms ? <AppText color="#fff">✓</AppText> : null}
        </View>
        <AppText variant="caption">I agree to the Terms of Service and Privacy Policy</AppText>
      </Pressable>
      <AppButton
        label={i18n.t('auth.createAccount')}
        disabled={!terms}
        loading={loading}
        onPress={handleSignUp}
      />
      <AuthLinkRow
        label={i18n.t('auth.alreadyHaveAccount')}
        actionLabel={i18n.t('auth.signIn')}
        onActionPress={() => navigate('/(auth)/sign-in')}
      />
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  fields: { gap: Spacing.three },
  terms: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
});
