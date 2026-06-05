import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthLinkRow } from '@/components/auth/AuthLinkRow';
import { DEFAULT_COUNTRY_CODE } from '@/constants/ethiopia';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { i18n } from '@/i18n';

export default function PhoneScreen() {
  const router = useRouter();
  const { sendPhoneOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const fullPhone = `${DEFAULT_COUNTRY_CODE}${phone.replace(/\s/g, '')}`;

  const handleSend = async () => {
    if (phone.replace(/\s/g, '').length < 9) {
      Alert.alert('Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      await sendPhoneOtp(fullPhone);
      navigate(`/(auth)/otp?phone=${encodeURIComponent(fullPhone)}`);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout>
      <AuthHeader title={i18n.t('auth.phoneTitle')} subtitle={i18n.t('auth.phoneSubtitle')} />
      <View style={styles.phoneRow}>
        <View style={styles.code}>
          <AppText variant="bodyStrong">{DEFAULT_COUNTRY_CODE}</AppText>
          <AppText variant="caption">🇪🇹</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AuthTextField
            label={i18n.t('auth.phoneNumber')}
            placeholder="9XX XXX XXXX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </View>
      <AppButton label={i18n.t('auth.sendCode')} onPress={handleSend} loading={loading} />
      <AuthLinkRow
        label={i18n.t('auth.backTo')}
        actionLabel={i18n.t('auth.signIn')}
        onActionPress={() => router.back()}
      />
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  phoneRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-end' },
  code: {
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.two,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 72,
  },
});
