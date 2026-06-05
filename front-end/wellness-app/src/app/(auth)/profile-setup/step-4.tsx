import React, { useState } from 'react';
import { navigate } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { LanguagePicker } from '@/components/features/onboarding/LanguagePicker';
import { useProfileSetup } from '@/contexts/ProfileSetupContext';

export default function ProfileStep4() {
  const { data, update } = useProfileSetup();
  const [lang, setLang] = useState<'en' | 'am'>(data.preferredLanguage);

  const continueNext = () => {
    update({ preferredLanguage: lang });
    navigate('/(auth)/profile-setup/step-5');
  };

  return (
    <AuthCardLayout>
      <AuthHeader title="Language" subtitle="Step 4 of 6 — Preview your UI" />
      <LanguagePicker value={lang} onChange={setLang} />
      <AppButton label="Continue" onPress={continueNext} />
    </AuthCardLayout>
  );
}
