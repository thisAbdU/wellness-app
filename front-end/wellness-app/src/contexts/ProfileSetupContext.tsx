import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ProfileSetupData } from '@/services/profileService';

const defaultData: ProfileSetupData = {
  fullName: '',
  age: 28,
  gender: 'Male',
  city: 'Addis Ababa',
  heightCm: 175,
  weightKg: 72,
  fitnessGoal: 'General Wellness',
  preferredLanguage: 'en',
  allergies: [],
  dislikedFoods: [],
  orthodoxFasting: false,
};

type ProfileSetupContextValue = {
  data: ProfileSetupData;
  update: (patch: Partial<ProfileSetupData>) => void;
  reset: () => void;
};

const ProfileSetupContext = createContext<ProfileSetupContextValue | null>(null);

export function ProfileSetupProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ProfileSetupData>(defaultData);

  const value = useMemo(
    () => ({
      data,
      update: (patch: Partial<ProfileSetupData>) => setData((d) => ({ ...d, ...patch })),
      reset: () => setData(defaultData),
    }),
    [data],
  );

  return (
    <ProfileSetupContext.Provider value={value}>{children}</ProfileSetupContext.Provider>
  );
}

export function useProfileSetup() {
  const ctx = useContext(ProfileSetupContext);
  if (!ctx) throw new Error('useProfileSetup must be used within ProfileSetupProvider');
  return ctx;
}
