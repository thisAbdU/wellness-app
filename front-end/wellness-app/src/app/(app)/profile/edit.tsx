import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { MOCK_USER } from '@/constants/mockData';

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState(MOCK_USER.name);
  const [age, setAge] = useState(String(MOCK_USER.age));
  const [city, setCity] = useState(MOCK_USER.city);
  const [height, setHeight] = useState(String(MOCK_USER.heightCm));
  const [weight, setWeight] = useState(String(MOCK_USER.weightKg));
  const [goal, setGoal] = useState(MOCK_USER.goal);

  return (
    <AppScreen>
      <ScreenHeader
        title="Edit profile"
        showBack
        right={
          <Pressable onPress={() => router.back()}>
            <AppText variant="link">Save</AppText>
          </Pressable>
        }
      />
      <AuthTextField label="Name" value={name} onChangeText={setName} />
      <AuthTextField label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
      <AuthTextField label="City" value={city} onChangeText={setCity} />
      <AuthTextField label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
      <AuthTextField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <AuthTextField label="Fitness goal" value={goal} onChangeText={setGoal} />
    </AppScreen>
  );
}
