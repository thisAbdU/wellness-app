import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing } from '@/constants/theme';

export default function EditProfile() {
  const router = useRouter();
  const { profile, isLoading, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name ?? '');
    setAge(profile.age != null ? String(profile.age) : '');
    setCity(profile.city ?? '');
    setHeight(profile.height_cm != null ? String(profile.height_cm) : '');
    setWeight(profile.weight_kg != null ? String(profile.weight_kg) : '');
    setGoal(profile.fitness_goal ?? '');
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        fullName: name.trim(),
        age: age ? Number(age) : undefined,
        city: city.trim(),
        heightCm: height ? Number(height) : undefined,
        weightKg: weight ? Number(weight) : undefined,
        fitnessGoal: goal.trim(),
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <AppScreen>
        <ScreenHeader title="Edit profile" showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Edit profile"
        showBack
        right={
          <Pressable onPress={handleSave} disabled={saving}>
            <AppText variant="link">{saving ? 'Saving…' : 'Save'}</AppText>
          </Pressable>
        }
      />
      {error ? (
        <AppText variant="caption" color={Colors.light.error} style={{ marginBottom: Spacing.two }}>
          {error}
        </AppText>
      ) : null}
      <AuthTextField label="Name" value={name} onChangeText={setName} />
      <AuthTextField label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
      <AuthTextField label="City" value={city} onChangeText={setCity} />
      <AuthTextField
        label="Height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />
      <AuthTextField
        label="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <AuthTextField label="Fitness goal" value={goal} onChangeText={setGoal} />
      <AppButton
        label="Save changes"
        onPress={handleSave}
        loading={saving}
        style={{ marginTop: Spacing.four }}
      />
    </AppScreen>
  );
}
