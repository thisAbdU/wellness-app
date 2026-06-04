import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthLinkRow } from '@/components/auth/AuthLinkRow';
import { DEFAULT_COUNTRY_CODE } from '@/constants/ethiopia';
import { Colors, Spacing } from '@/constants/theme';
import { i18n } from '@/i18n';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

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
      <AppButton
        label={i18n.t('auth.sendCode')}
        onPress={() => navigate('/(auth)/otp')}
      />
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
