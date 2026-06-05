import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { navigate } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useProfileSetup } from '@/contexts/ProfileSetupContext';

const GOALS = [
  'Lose Weight',
  'Maintain',
  'Gain Muscle',
  'Improve Endurance',
  'General Wellness',
];

export default function ProfileStep3() {
  const { data, update } = useProfileSetup();
  const [goal, setGoal] = useState(data.fitnessGoal);

  const continueNext = () => {
    update({ fitnessGoal: goal });
    navigate('/(auth)/profile-setup/step-4');
  };

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
      <AppButton label="Continue" onPress={continueNext} />
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
