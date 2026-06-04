import React from 'react';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { Spacing } from '@/constants/theme';

export default function EmergencyContactScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Emergency contact" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        Current: Mom · +251 911 234 567
      </AppText>
      <AuthTextField label="Name" placeholder="Contact name" />
      <AuthTextField label="Phone" placeholder="+251..." keyboardType="phone-pad" />
      <AuthTextField label="Relationship" placeholder="Family" />
      <AppButton label="Save contact" onPress={() => {}} style={{ marginTop: Spacing.three }} />
      <AppButton label="Send test notification" variant="secondary" onPress={() => {}} />
    </AppScreen>
  );
}
