import React from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Spacing } from '@/constants/theme';

export default function HealthConnectUnavailable() {
  const router = useRouter();

  return (
    <AppScreen>
      <View style={styles.content}>
        <AppText style={{ fontSize: 48 }}>🏥</AppText>
        <AppText variant="subtitle">Health Connect required</AppText>
        <AppText variant="caption" align="center">
          Health Connect aggregates data from Samsung Health, Garmin, Fitbit, and more on
          Android.
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
          onPress={() => replace('/(app)/(tabs)/activity/manual-entry')}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
  },
});
