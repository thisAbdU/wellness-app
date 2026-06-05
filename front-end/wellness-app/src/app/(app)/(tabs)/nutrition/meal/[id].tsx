import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import type { Food } from '@/lib/api/types';
import { fetchFoods } from '@/services/profileService';
import { useLocalization } from '@/hooks/useLocalization';

export default function MealDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale } = useLocalization();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods()
      .then(setFoods)
      .catch(() => setFoods([]))
      .finally(() => setLoading(false));
  }, []);

  const meal = foods.find((f) => f.id === id);

  const alternatives = useMemo(() => {
    if (!meal) return [];
    return foods.filter(
      (f) => f.id !== meal.id && f.meal_type.some((mt) => meal.meal_type.includes(mt)),
    );
  }, [foods, meal]);

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="Meal" showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  if (!meal) {
    return (
      <AppScreen>
        <ScreenHeader title="Meal" showBack />
        <AppText variant="caption">Food not found.</AppText>
      </AppScreen>
    );
  }

  const mealLabel = meal.meal_type.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(' / ');
  const displayName = locale === 'am' && meal.name_am ? meal.name_am : meal.name;

  return (
    <AppScreen>
      <ScreenHeader title={mealLabel} showBack />
      <AppText variant="title">{displayName}</AppText>
      {meal.name_am && locale !== 'am' ? (
        <AppText variant="caption">{meal.name_am}</AppText>
      ) : null}
      <AppCard style={styles.card}>
        <AppText variant="bodyStrong">Macros</AppText>
        <AppText variant="caption">
          Protein {meal.protein_g}g · Carbs {meal.carbs_g}g · Fat {meal.fat_g}g · {meal.calories}{' '}
          kcal
        </AppText>
      </AppCard>
      {meal.category ? (
        <AppCard style={styles.card}>
          <AppText variant="bodyStrong">Category</AppText>
          <AppText variant="caption">{meal.category}</AppText>
        </AppCard>
      ) : null}
      {alternatives.length > 0 ? (
        <>
          <AppText variant="overline" style={{ marginTop: Spacing.two }}>
            Alternatives
          </AppText>
          <AppText variant="caption">
            {alternatives
              .slice(0, 5)
              .map((a) => (locale === 'am' && a.name_am ? a.name_am : a.name))
              .join(' · ')}
          </AppText>
        </>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', padding: Spacing.four },
  card: { marginTop: Spacing.three, gap: Spacing.one },
});
