import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { OtpInput } from '@/components/ui/OtpInput';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { markAuthenticated } from '@/lib/appState';
import { Spacing } from '@/constants/theme';

export default function OtpScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <AuthCardLayout>
      <AuthHeader title="Verify code" subtitle="Enter the 6-digit code we sent" />
      <OtpInput value={code} onChange={setCode} />
      <AppText variant="caption" align="center">
        {seconds > 0 ? `Resend in ${seconds}s` : 'Resend code'}
      </AppText>
      <AppButton
        label="Verify"
        disabled={code.length < 6}
        onPress={() => {
          markAuthenticated();
          replace('/(auth)/profile-setup/step-1');
        }}
        style={{ marginTop: Spacing.two }}
      />
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({});
