import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Colors, Spacing } from '@/constants/theme';

const GOALS = [
  'Lose Weight',
  'Maintain',
  'Gain Muscle',
  'Improve Endurance',
  'General Wellness',
];

export default function ProfileStep3() {
  const router = useRouter();
  const [goal, setGoal] = useState('General Wellness');

  return (
    <AuthCardLayout>
      <AuthHeader title="Fitness goal" subtitle="Step 3 of 6" />
      <View style={styles.grid}>
        {GOALS.map((g) => (
          <Pressable
            key={g}
            style={[styles.card, goal === g && styles.cardActive]}
            onPress={() => setGoal(g)}
          >
            <AppText variant="bodyStrong">{g}</AppText>
          </Pressable>
        ))}
      </View>
      <AppButton label="Continue" onPress={() => navigate('/(auth)/profile-setup/step-4')} />
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.two },
  card: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  cardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
});
