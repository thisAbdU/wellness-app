import React, { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { OtpInput } from '@/components/ui/OtpInput';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProfile, isProfileComplete } from '@/services/profileService';
import { supabase } from '@/lib/supabase';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyPhoneOtp, sendPhoneOtp } = useAuth();
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleVerify = async () => {
    if (!phone || code.length < 6) return;
    setLoading(true);
    try {
      await verifyPhoneOtp(phone, code);
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      const profile = userId ? await fetchProfile(userId) : null;
      replace(isProfileComplete(profile) ? '/(app)/(tabs)/home' : '/(auth)/profile-setup/step-1');
    } catch (e) {
      Alert.alert('Verification failed', e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || seconds > 0) return;
    try {
      await sendPhoneOtp(phone);
      setSeconds(60);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to resend');
    }
  };

  return (
    <AuthCardLayout>
      <AuthHeader title="Verify code" subtitle="Enter the 6-digit code we sent" />
      <OtpInput value={code} onChange={setCode} />
      <Pressable onPress={handleResend} disabled={seconds > 0}>
        <AppText variant="caption" align="center">
          {seconds > 0 ? `Resend in ${seconds}s` : 'Resend code'}
        </AppText>
      </Pressable>
      <AppButton
        label="Verify"
        disabled={code.length < 6}
        loading={loading}
        onPress={handleVerify}
        style={{ marginTop: Spacing.two }}
      />
    </AuthCardLayout>
  );
}
