import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { navigate } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PermissionCard } from '@/components/features/onboarding/PermissionCard';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

export default function ProfileStep5() {
  const [health, setHealth] = useState(false);
  const [notif, setNotif] = useState(false);
  const [location, setLocation] = useState(false);

  const requestHealth = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Health Connect', 'Available on Android. You can connect later in Activity.');
      setHealth(true);
      return;
    }
    setHealth(true);
  };

  const requestNotif = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotif(status === 'granted');
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocation(status === 'granted');
  };

  return (
    <AuthCardLayout>
      <AuthHeader title="Permissions" subtitle="Step 5 of 6" />
      <PermissionCard
        icon="❤️"
        title="Health Connect"
        description="Read steps, sleep, heart rate, and workouts from your devices."
        allowed={health}
        onAllow={requestHealth}
      />
      <PermissionCard
        icon="🔔"
        title="Notifications"
        description="Streak reminders, health alerts, and challenge updates."
        allowed={notif}
        onAllow={requestNotif}
      />
      <PermissionCard
        icon="📍"
        title="Location"
        description="Neighborhood and city leaderboard rankings."
        allowed={location}
        onAllow={requestLocation}
      />
      <AppButton label="Continue" onPress={() => navigate('/(auth)/profile-setup/step-6')} />
    </AuthCardLayout>
  );
}
