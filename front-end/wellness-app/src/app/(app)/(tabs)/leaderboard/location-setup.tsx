import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { ETHIOPIA_CITIES, ETHIOPIA_REGIONS } from '@/constants/ethiopia';
import { Spacing } from '@/constants/theme';
import { AppText } from '@/components/ui/AppText';

export default function LocationSetup() {
  const [region, setRegion] = useState<string>(ETHIOPIA_REGIONS[0]);
  const [city, setCity] = useState<string>(ETHIOPIA_CITIES[0]);

  return (
    <AppScreen>
      <ScreenHeader title="Location" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        Fine-grained location powers city, neighborhood, and university rankings.
      </AppText>
      <AuthTextField label="Regional state" value={region} onChangeText={setRegion} />
      <AuthTextField label="City" value={city} onChangeText={setCity} />
      <AuthTextField label="Neighborhood" placeholder="Search..." />
      <AuthTextField label="University / Company (optional)" placeholder="Search..." />
      <AppButton label="Save location" onPress={() => {}} style={{ marginTop: Spacing.four }} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({});
