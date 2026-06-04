import React from 'react';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { completeProfileSetup } from '@/lib/appState';
import { DEFAULT_COUNTRY_CODE } from '@/constants/ethiopia';

export default function ProfileStep6() {
  const router = useRouter();

  const finish = () => {
    completeProfileSetup();
    replace('/(app)/(tabs)/home');
  };

  return (
    <AuthCardLayout>
      <AuthHeader title="Emergency contact" subtitle="Step 6 of 6 — Optional" />
      <AuthTextField label="Contact name" placeholder="Name" />
      <AuthTextField
        label="Phone"
        placeholder={`${DEFAULT_COUNTRY_CODE} 9XX XXX XXXX`}
        keyboardType="phone-pad"
      />
      <AuthTextField label="Relationship" placeholder="Family / Friend / Doctor" />
      <AppButton label="Save & finish" onPress={finish} />
      <AppButton label="Skip for now" variant="ghost" onPress={finish} />
    </AuthCardLayout>
  );
}
