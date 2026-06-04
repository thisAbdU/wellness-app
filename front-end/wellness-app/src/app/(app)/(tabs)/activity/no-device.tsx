import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function NoDeviceEmpty() {
  const router = useRouter();

  return (
    <AppScreen>
      <ScreenHeader title="Activity" showBack />
      <View style={styles.empty}>
        <AppText style={{ fontSize: 48 }}>⌚</AppText>
        <AppText variant="subtitle">No device connected</AppText>
        <AppText variant="caption" align="center">
          Sync steps, sleep, and workouts by connecting Health Connect or a wearable.
        </AppText>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigate('/(app)/(tabs)/activity/devices')}
        >
          <AppText variant="bodyStrong" color="#fff">
            Connect a device
          </AppText>
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  cta: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
    marginTop: Spacing.two,
  },
});
