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

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  return (
    <AppScreen>
      <View style={styles.container}>
        <AuthHeader
          title={i18n.t('auth.phoneTitle')}
          subtitle={i18n.t('auth.phoneSubtitle')}
        />

        <AppCard style={styles.card}>
          <AuthTextField
            label={i18n.t('auth.phoneNumber')}
            placeholder="+251 ..."
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={phone}
            onChangeText={setPhone}
          />

          {codeSent ? (
            <>
              <AuthTextField
                label={i18n.t('auth.verificationCode')}
                placeholder="123456"
                keyboardType="number-pad"
                autoCapitalize="none"
                value={code}
                onChangeText={setCode}
              />

              <AppButton
                label={i18n.t('auth.verifyCode')}
                onPress={() => {
                  // Supabase later
                  router.replace('/home');
                }}
              />
            </>
          ) : (
            <AppButton
              label={i18n.t('auth.sendCode')}
              onPress={() => setCodeSent(true)}
            />
          )}

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