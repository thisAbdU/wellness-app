import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { LanguagePicker } from '@/components/features/onboarding/LanguagePicker';

export default function ProfileStep4() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'am'>('en');

  return (
    <AuthCardLayout>
      <AuthHeader title="Language" subtitle="Step 4 of 6 — Preview your UI" />
      <LanguagePicker value={lang} onChange={setLang} />
      <AppButton label="Continue" onPress={() => navigate('/(auth)/profile-setup/step-5')} />
    </AuthCardLayout>
  );
}
