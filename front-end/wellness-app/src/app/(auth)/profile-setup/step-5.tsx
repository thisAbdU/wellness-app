import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PermissionCard } from '@/components/features/onboarding/PermissionCard';

export default function ProfileStep5() {
  const router = useRouter();
  const [health, setHealth] = useState(false);
  const [notif, setNotif] = useState(false);
  const [location, setLocation] = useState(false);

  return (
    <AuthCardLayout>
      <AuthHeader title="Permissions" subtitle="Step 5 of 6" />
      <PermissionCard
        icon="❤️"
        title="Health Connect"
        description="Read steps, sleep, heart rate, and workouts from your devices."
        allowed={health}
        onAllow={() => setHealth(true)}
      />
      <PermissionCard
        icon="🔔"
        title="Notifications"
        description="Streak reminders, health alerts, and challenge updates."
        allowed={notif}
        onAllow={() => setNotif(true)}
      />
      <PermissionCard
        icon="📍"
        title="Location"
        description="Neighborhood and city leaderboard rankings."
        allowed={location}
        onAllow={() => setLocation(true)}
      />
      <AppButton label="Continue" onPress={() => navigate('/(auth)/profile-setup/step-6')} />
    </AuthCardLayout>
  );
}
