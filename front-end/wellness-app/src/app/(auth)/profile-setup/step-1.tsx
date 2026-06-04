import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { ETHIOPIA_CITIES } from '@/constants/ethiopia';
import { Colors, Spacing } from '@/constants/theme';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function ProfileStep1() {
  const router = useRouter();
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState<string>(ETHIOPIA_CITIES[0]);

  return (
    <AuthCardLayout>
      <AuthHeader title="About you" subtitle="Step 1 of 6 — Personal info" />
      <AuthTextField label="Full name" placeholder="Your name" />
      <AuthTextField label="Age" keyboardType="numeric" placeholder="28" />
      <AppText variant="caption">Gender</AppText>
      <View style={styles.chips}>
        {GENDERS.map((g) => (
          <Pressable
            key={g}
            style={[styles.chip, gender === g && styles.chipActive]}
            onPress={() => setGender(g)}
          >
            <AppText variant="caption">{g}</AppText>
          </Pressable>
        ))}
      </View>
      <AuthTextField label="City" value={city} onChangeText={setCity} />
      <AppButton label="Continue" onPress={() => navigate('/(auth)/profile-setup/step-2')} />
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: { borderColor: Colors.light.primary, backgroundColor: Colors.light.primaryLight },
});
