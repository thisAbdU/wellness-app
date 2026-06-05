import { Stack } from 'expo-router';
import { ProfileSetupProvider } from '@/contexts/ProfileSetupContext';

export default function ProfileSetupLayout() {
  return (
    <ProfileSetupProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ProfileSetupProvider>
  );
}
