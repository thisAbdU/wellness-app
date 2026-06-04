import React from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SettingsRow } from '@/components/features/profile/SettingsRow';
import { Spacing } from '@/constants/theme';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build = Constants.expoConfig?.android?.versionCode ?? '1';

  return (
    <AppScreen>
      <ScreenHeader title="About" showBack />
      <View style={styles.hero}>
        <AppText variant="title">Wellness</AppText>
        <AppText variant="caption">
          v{version} (build {build})
        </AppText>
      </View>
      <SettingsRow label="Privacy Policy" onPress={() => {}} />
      <SettingsRow label="Terms of Service" onPress={() => {}} />
      <AppText variant="caption" style={{ marginTop: Spacing.four }}>
        Acknowledgements: Expo, Supabase, Google Gemini, Health Connect.
      </AppText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: Spacing.four, gap: Spacing.one },
});
