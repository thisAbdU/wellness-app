import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

function parseHealthConditions(conditions: string[] | string | undefined) {
  const arr = Array.isArray(conditions) ? conditions : conditions ? [String(conditions)] : [];
  const allergies: string[] = [];
  const dislikedFoods: string[] = [];
  let orthodoxFasting = false;
  for (const c of arr) {
    if (c.startsWith('allergy:')) allergies.push(c.slice(8));
    else if (c.startsWith('dislike:')) dislikedFoods.push(c.slice(8));
    else if (c === 'orthodox_fasting') orthodoxFasting = true;
  }
  return {
    allergies: allergies.join(', '),
    dislikedFoods: dislikedFoods.join(', '),
    orthodoxFasting,
  };
}

export default function NutritionGoals() {
  const router = useRouter();
  const { profile, updateProfile } = useAuth();
  const parsed = parseHealthConditions(profile?.health_conditions);
  const [allergies, setAllergies] = useState(parsed.allergies);
  const [disliked, setDisliked] = useState(parsed.dislikedFoods);
  const [fasting, setFasting] = useState(parsed.orthodoxFasting);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = parseHealthConditions(profile?.health_conditions);
    setAllergies(next.allergies);
    setDisliked(next.dislikedFoods);
    setFasting(next.orthodoxFasting);
  }, [profile?.health_conditions]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        allergies: allergies
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        dislikedFoods: disliked
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        orthodoxFasting: fasting,
      });
      router.back();
    } catch {
      setSaving(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title="Goals & preferences" showBack />
      <AuthTextField
        label="Allergies"
        placeholder="e.g. peanuts"
        value={allergies}
        onChangeText={setAllergies}
      />
      <AuthTextField
        label="Disliked foods"
        placeholder="Optional"
        value={disliked}
        onChangeText={setDisliked}
      />
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
      <AppButton
        label="Save preferences"
        onPress={handleSave}
        disabled={saving}
        style={{ marginTop: Spacing.four }}
      />
    </AppScreen>
  );
}
