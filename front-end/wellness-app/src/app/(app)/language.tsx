import React, { useState } from 'react';
import { AppScreen } from '@/components/ui/AppScreen';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { LanguagePicker } from '@/components/features/onboarding/LanguagePicker';

export default function LanguageSettings() {
  const [lang, setLang] = useState<'en' | 'am'>('en');

  return (
    <AppScreen>
      <ScreenHeader title="Language" showBack />
      <LanguagePicker value={lang} onChange={setLang} />
    </AppScreen>
  );
}
