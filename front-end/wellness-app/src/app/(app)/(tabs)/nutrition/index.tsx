import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Food, NutritionPlan } from '@/lib/api/types';
import { fetchFoods } from '@/services/profileService';
import { useLocalization } from '@/hooks/useLocalization';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function NutritionDailyPlan() {
  const { locale } = useLocalization();
  const [foods, setFoods] = useState<Food[]>([]);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [foodList, dailyPlan] = await Promise.all([
        fetchFoods(),
        api.nutrition.dailyPlan(locale),
      ]);
      setFoods(foodList);
      setPlan(dailyPlan);
    } catch {
      setFoods([]);
      setPlan(null);
    }
  }, [locale]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const grouped = useMemo(() => {
    const map: Record<string, Food[]> = {};
    for (const food of foods) {
      for (const mt of food.meal_type) {
        if (!map[mt]) map[mt] = [];
        map[mt].push(food);
      }
    }
    return map;
  }, [foods]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="Nutrition" showMenu />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Nutrition" showMenu />
      <AppButton
        label="Refresh plan"
        variant="secondary"
        onPress={handleRefresh}
        disabled={refreshing}
      />
      {plan ? (
        <AppCard style={styles.planCard}>
          <AppText variant="overline">Today&apos;s plan</AppText>
          <AppText variant="caption">{plan.plan}</AppText>
          <AppText variant="caption" style={{ marginTop: Spacing.two }}>
            Target {plan.targets.calories_min}–{plan.targets.calories_max} kcal · TDEE{' '}
            {plan.targets.tdee}
          </AppText>
        </AppCard>
      ) : null}
      {MEAL_ORDER.filter((mt) => grouped[mt]?.length).map((mealType) => (
        <View key={mealType}>
          <AppText variant="overline" style={styles.mealSection}>
            {MEAL_LABELS[mealType] ?? mealType}
          </AppText>
          {grouped[mealType].map((meal) => (
            <TouchableOpacity
              key={meal.id}
              onPress={() => navigate(`/(app)/(tabs)/nutrition/meal/${meal.id}`)}
            >
              <AppCard style={styles.meal}>
                <AppText variant="bodyStrong">
                  {locale === 'am' && meal.name_am ? meal.name_am : meal.name}
                </AppText>
                {meal.name_am && locale !== 'am' ? (
                  <AppText variant="caption">{meal.name_am}</AppText>
                ) : null}
                <View style={styles.macros}>
                  <MacroBar label="P" value={meal.protein_g} color={Colors.light.primary} />
                  <MacroBar label="C" value={meal.carbs_g} color={Colors.light.accentPurple} />
                  <MacroBar label="F" value={meal.fat_g} color={Colors.light.warning} />
                </View>
                <AppText variant="caption">{meal.calories} kcal</AppText>
              </AppCard>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <TouchableOpacity onPress={() => navigate('/(app)/(tabs)/nutrition/history')}>
        <AppText variant="link">Nutrition history →</AppText>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: Spacing.two }}
        onPress={() => navigate('/(app)/(tabs)/nutrition/goals')}
      >
        <AppText variant="link">Goals & preferences →</AppText>
      </TouchableOpacity>
    </AppScreen>
  );
}

function MacroBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.macroCol}>
      <View
        style={[styles.macroFill, { backgroundColor: color, width: `${Math.min(value, 50)}%` }]}
      />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', padding: Spacing.four },
  planCard: { marginTop: Spacing.three, gap: Spacing.one },
  mealSection: { marginTop: Spacing.three, marginBottom: Spacing.one },
  meal: { marginBottom: Spacing.two, gap: Spacing.one },
  macros: { flexDirection: 'row', gap: Spacing.two, marginVertical: Spacing.two },
  macroCol: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  macroFill: { height: '100%', borderRadius: Radius.sm },
});
