import React from 'react';
import { StyleSheet } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Spacing } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Data we collect',
    body: 'We collect profile information, health metrics you sync from connected devices, and usage data to personalize your BIRTU experience.',
  },
  {
    title: 'How we use it',
    body: 'Your data powers personalized coaching, streak tracking, leaderboards, and emergency alerts. We never sell your personal health data.',
  },
  {
    title: 'Your rights',
    body: 'You can export or delete your data at any time from Settings. Contact support to request a full account removal.',
  },
  {
    title: 'Security',
    body: 'Data is encrypted in transit and stored securely. Emergency location is only shared when you trigger an SOS alert.',
  },
];

export default function PrivacyScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Privacy Policy" showBack />
      <AppText variant="caption" style={styles.updated}>
        Last updated: June 2026
      </AppText>
      {SECTIONS.map((s) => (
        <React.Fragment key={s.title}>
          <AppText variant="bodyStrong" style={styles.heading}>
            {s.title}
          </AppText>
          <AppText variant="body" style={styles.body}>
            {s.body}
          </AppText>
        </React.Fragment>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  updated: { marginBottom: Spacing.four },
  heading: { marginTop: Spacing.four, marginBottom: Spacing.one },
  body: { lineHeight: 22 },
});
