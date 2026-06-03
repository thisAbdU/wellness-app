import * as Localization from 'expo-localization';

export function getCurrentLocale() {
  return Localization.getLocales()[0]?.languageTag ?? 'en';
}

export function getCurrentLanguage() {
  return Localization.getLocales()[0]?.languageCode ?? 'en';
}