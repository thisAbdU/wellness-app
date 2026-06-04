import React from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Spacing } from '@/constants/theme';

export default function HealthConnectUnavailableApp() {
  const router = useRouter();

  return (
    <AppScreen>
      <ScreenHeader title="Health Connect" showBack />
      <View style={styles.content}>
        <AppText style={{ fontSize: 48 }}>🏥</AppText>
        <AppText variant="subtitle">Health Connect required</AppText>
        <AppText variant="caption" align="center">
          Install Health Connect to sync steps, sleep, and workouts from your devices.
        </AppText>
        {Platform.OS === 'android' ? (
          <AppButton
            label="Install Health Connect"
            onPress={() =>
              Linking.openURL(
                'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata',
              )
            }
          />
        ) : null}
        <AppButton
          label="Continue with manual entry"
          variant="secondary"
          onPress={() => navigate('/(app)/(tabs)/activity/manual-entry')}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.five,
  },
});
