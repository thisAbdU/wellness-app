import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { Spacing } from '@/constants/theme';

export default function NutritionGoals() {
  const [fasting, setFasting] = useState(true);

  return (
    <AppScreen>
      <ScreenHeader title="Goals & preferences" showBack />
      <AuthTextField label="Allergies" placeholder="e.g. peanuts" />
      <AuthTextField label="Disliked foods" placeholder="Optional" />
      <AppText variant="bodyStrong" style={{ marginTop: Spacing.three }}>
        Orthodox fasting calendar
      </AppText>
      <AppText variant="caption">
        Tsom / Hudadi days auto-detected by date when enabled.
      </AppText>
      <AppButton
        label={fasting ? 'Fasting schedule: On' : 'Fasting schedule: Off'}
        variant="secondary"
        onPress={() => setFasting(!fasting)}
        style={{ marginTop: Spacing.three }}
      />
      <AppButton label="Save preferences" onPress={() => {}} style={{ marginTop: Spacing.four }} />
    </AppScreen>
  );
}
