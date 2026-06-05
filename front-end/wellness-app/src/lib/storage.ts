import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  onboarding: 'wellness_has_seen_onboarding',
  locale: 'wellness_locale',
} as const;

const isServer = typeof window === 'undefined';

async function secureSet(key: string, value: string): Promise<void> {
  if (isServer) return;
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function secureGet(key: string): Promise<string | null> {
  if (isServer) return null;
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function secureDelete(key: string): Promise<void> {
  if (isServer) return;
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getHasSeenOnboarding(): Promise<boolean> {
  const v = await secureGet(KEYS.onboarding);
  return v === 'true';
}

export async function setHasSeenOnboarding(): Promise<void> {
  await secureSet(KEYS.onboarding, 'true');
}

export async function getStoredLocale(): Promise<'en' | 'am' | null> {
  const v = await secureGet(KEYS.locale);
  return v === 'am' || v === 'en' ? v : null;
}

export async function setStoredLocale(locale: 'en' | 'am'): Promise<void> {
  await secureSet(KEYS.locale, locale);
}

export async function clearLocalFlags(): Promise<void> {
  await secureDelete(KEYS.onboarding);
  await secureDelete(KEYS.locale);
}
