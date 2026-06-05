import { useCallback, useEffect, useState } from 'react';
import { i18n } from '@/i18n';
import { getStoredLocale, setStoredLocale } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

export type AppLocale = 'en' | 'am';

export function useLocalization() {
  const { profile, updateProfile } = useAuth();
  const [locale, setLocale] = useState<AppLocale>(
    profile?.preferred_language === 'am' ? 'am' : 'en',
  );

  useEffect(() => {
    async function load() {
      const stored = await getStoredLocale();
      const fromProfile = profile?.preferred_language;
      const next: AppLocale =
        fromProfile === 'am' || stored === 'am' ? 'am' : 'en';
      i18n.locale = next;
      setLocale(next);
    }
    load();
  }, [profile?.preferred_language]);

  const setAppLocale = useCallback(
    async (next: AppLocale) => {
      i18n.locale = next;
      setLocale(next);
      await setStoredLocale(next);
      try {
        await updateProfile({ preferredLanguage: next });
      } catch {
        // profile may not exist yet during onboarding
      }
    },
    [updateProfile],
  );

  return { locale, setAppLocale, t: i18n.t.bind(i18n) };
}
