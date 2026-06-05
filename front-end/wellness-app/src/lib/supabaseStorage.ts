import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/** True during Expo Router web SSR (Node has no window). */
const isServer = typeof window === 'undefined';

/**
 * Supabase auth storage that is safe during web SSR.
 * AsyncStorage's web implementation accesses `window` and crashes in Node.
 */
export const supabaseAuthStorage = {
  getItem(key: string): string | null | Promise<string | null> {
    if (isServer) return null;
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },

  setItem(key: string, value: string): void | Promise<void> {
    if (isServer) return;
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {
        // ignore quota / private mode errors
      }
      return;
    }
    return AsyncStorage.setItem(key, value);
  },

  removeItem(key: string): void | Promise<void> {
    if (isServer) return;
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};
