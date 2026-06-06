import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { navigate } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { ETHIOPIA_CITIES } from '@/constants/ethiopia';
import { Colors, Spacing } from '@/constants/theme';
import { useProfileSetup } from '@/contexts/ProfileSetupContext';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function ProfileStep1() {
  const { data, update } = useProfileSetup();
  const [name, setName] = useState(data.fullName);
  const [age, setAge] = useState(String(data.age));
  const [gender, setGender] = useState(data.gender);
  const [city, setCity] = useState(data.city || ETHIOPIA_CITIES[0]);

  const continueNext = () => {
    update({
      fullName: name,
      age: parseInt(age, 10) || 28,
      gender,
      city,
    });
    navigate('/(auth)/profile-setup/step-2');
  };

  return (
    <AuthCardLayout>
      <AuthHeader title="About you" subtitle="Step 1 of 6  Personal info" />
      <AuthTextField label="Full name" placeholder="Your name" value={name} onChangeText={setName} />
      <AuthTextField label="Age" keyboardType="numeric" placeholder="28" value={age} onChangeText={setAge} />
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
      <AppButton label="Continue" onPress={continueNext} disabled={!name.trim()} />
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
