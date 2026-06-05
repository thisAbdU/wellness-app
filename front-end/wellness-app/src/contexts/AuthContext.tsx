import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getHasSeenOnboarding, setHasSeenOnboarding } from '@/lib/storage';
import { startBackgroundSync, stopBackgroundSync } from '@/db/backgroundSync';
import {
  fetchProfile,
  isProfileComplete,
  upsertProfile,
  type ProfileSetupData,
} from '@/services/profileService';
import type { UserProfile } from '@/lib/api/types';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
  hasSeenOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  saveProfileSetup: (data: ProfileSetupData) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileSetupData & UserProfile>) => Promise<void>;
  getInitialRoute: () => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const seen = await getHasSeenOnboarding();
      if (mounted) setHasSeenOnboardingState(seen);

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user?.id) {
        const p = await fetchProfile(data.session.user.id);
        if (mounted) setProfile(p);
        startBackgroundSync({ userId: data.session.user.id });
      }

      if (mounted) setIsLoading(false);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user?.id) {
        const p = await fetchProfile(newSession.user.id);
        setProfile(p);
        startBackgroundSync({ userId: newSession.user.id });
      } else {
        setProfile(null);
        stopBackgroundSync();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    stopBackgroundSync();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const sendPhoneOtp = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) throw error;
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setHasSeenOnboarding();
    setHasSeenOnboardingState(true);
  }, []);

  const saveProfileSetup = useCallback(
    async (data: ProfileSetupData) => {
      if (!user?.id) throw new Error('Not authenticated');
      const saved = await upsertProfile(user.id, data);
      setProfile(saved);
    },
    [user?.id],
  );

  const updateProfile = useCallback(
    async (data: Partial<ProfileSetupData & UserProfile>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const saved = await upsertProfile(user.id, data);
      setProfile(saved);
    },
    [user?.id],
  );

  const getInitialRoute = useCallback(() => {
    if (!hasSeenOnboarding) return '/(auth)/onboarding';
    if (!session) return '/(auth)/sign-in';
    if (!isProfileComplete(profile)) return '/(auth)/profile-setup/step-1';
    return '/(app)/(tabs)/home';
  }, [hasSeenOnboarding, session, profile]);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      isLoading,
      isAuthenticated: Boolean(session),
      hasCompletedProfile: isProfileComplete(profile),
      hasSeenOnboarding,
      signIn,
      signUp,
      signOut,
      resetPassword,
      sendPhoneOtp,
      verifyPhoneOtp,
      completeOnboarding,
      saveProfileSetup,
      refreshProfile,
      updateProfile,
      getInitialRoute,
    }),
    [
      session,
      user,
      profile,
      isLoading,
      hasSeenOnboarding,
      signIn,
      signUp,
      signOut,
      resetPassword,
      sendPhoneOtp,
      verifyPhoneOtp,
      completeOnboarding,
      saveProfileSetup,
      refreshProfile,
      updateProfile,
      getInitialRoute,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
