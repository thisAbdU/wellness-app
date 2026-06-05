import React from 'react';
import { AppScreen } from '@/components/ui/AppScreen';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { LanguagePicker } from '@/components/features/onboarding/LanguagePicker';
import { useLocalization } from '@/hooks/useLocalization';

export default function LanguageSettings() {
  const { locale, setAppLocale } = useLocalization();

  return (
    <AppScreen>
      <ScreenHeader title="Language" showBack />
      <LanguagePicker value={locale} onChange={setAppLocale} />
    </AppScreen>
  );
}
