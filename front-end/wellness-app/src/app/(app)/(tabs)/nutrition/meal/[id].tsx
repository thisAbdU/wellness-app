import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { MOCK_MEALS } from '@/constants/mockData';
import { Spacing } from '@/constants/theme';

export default function MealDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meal = MOCK_MEALS.find((m) => m.id === id) ?? MOCK_MEALS[0];

  return (
    <AppScreen>
      <ScreenHeader title={meal.type} showBack />
      <AppText variant="title">{meal.nameEn}</AppText>
      <AppText variant="caption">{meal.nameAm}</AppText>
      <AppCard style={styles.card}>
        <AppText variant="bodyStrong">Macros</AppText>
        <AppText variant="caption">
          Protein {meal.protein}g · Carbs {meal.carbs}g · Fat {meal.fat}g · {meal.calories} kcal
        </AppText>
      </AppCard>
      <AppCard style={styles.card}>
        <AppText variant="bodyStrong">Why recommended</AppText>
        <AppText variant="caption">
          High protein after yesterday&apos;s workout — supports recovery.
        </AppText>
      </AppCard>
      <AppText variant="overline" style={{ marginTop: Spacing.two }}>
        Alternatives
      </AppText>
      <AppText variant="caption">Doro wat with greens · Lentil fitfit</AppText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: Spacing.three, gap: Spacing.one },
});
