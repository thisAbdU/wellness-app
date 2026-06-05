import React from 'react';
import { StyleSheet } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Spacing } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Acceptance',
    body: 'By using Wellness, you agree to these terms. If you do not agree, please discontinue use of the app.',
  },
  {
    title: 'Health disclaimer',
    body: 'Wellness provides general wellness guidance, not medical advice. Always consult a healthcare professional for medical decisions.',
  },
  {
    title: 'Account responsibility',
    body: 'You are responsible for keeping your login credentials secure and for all activity under your account.',
  },
  {
    title: 'Emergency features',
    body: 'SOS and fall detection are assistive tools and may not work in all situations. Do not rely on them as a substitute for professional emergency services.',
  },
];

export default function TermsScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Terms of Service" showBack />
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
