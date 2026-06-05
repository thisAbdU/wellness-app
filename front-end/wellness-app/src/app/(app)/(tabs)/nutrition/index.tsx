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
import { useAuth } from '@/contexts/AuthContext';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function NutritionDailyPlan() {
  const { locale } = useLocalization();
  const { user, isLoading: authLoading } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setError('Sign in to load your nutrition plan.');
      setFoods([]);
      setPlan(null);
      return;
    }

    setError(null);
    try {
      const [foodList, dailyPlan] = await Promise.all([
        fetchFoods().catch(() => [] as Food[]),
        api.nutrition.dailyPlan(locale),
      ]);
      setFoods(foodList);
      setPlan(dailyPlan);
    } catch (e) {
      setFoods([]);
      setPlan(null);
      setError(e instanceof Error ? e.message : 'Failed to load nutrition plan');
    }
  }, [locale, user?.id]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load, authLoading]);

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

  if (loading || authLoading) {
    return (
      <AppScreen>
        <ScreenHeader title="Nutrition" showMenu />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  const hasMeals = MEAL_ORDER.some((mt) => grouped[mt]?.length);

  return (
    <AppScreen>
      <ScreenHeader title="Nutrition" showMenu />
      <AppText variant="caption" style={styles.subtitle}>
        Ethiopian meal ideas tailored to your goals and activity.
      </AppText>

      {error ? (
        <AppCard style={styles.errorCard}>
          <AppText variant="bodyStrong" color={Colors.light.error}>
            Could not load plan
          </AppText>
          <AppText variant="caption" style={{ marginTop: Spacing.one }}>
            {error}
          </AppText>
          <AppText variant="caption" style={{ marginTop: Spacing.one }}>
            Ensure the backend is running and you are signed in. Restart the API after updating
            .env.
          </AppText>
        </AppCard>
      ) : null}

      <AppButton
        label="Refresh plan"
        variant="secondary"
        onPress={handleRefresh}
        disabled={refreshing}
      />

      {plan ? (
        <AppCard style={styles.planCard}>
          <AppText variant="overline">Today&apos;s plan</AppText>
          <AppText variant="body" style={styles.planText}>
            {plan.plan}
          </AppText>
          <View style={styles.targetRow}>
            <TargetPill
              label="Target"
              value={`${plan.targets.calories_min}–${plan.targets.calories_max} kcal`}
            />
            <TargetPill label="TDEE" value={`${plan.targets.tdee} kcal`} />
          </View>
        </AppCard>
      ) : !error ? (
        <AppCard style={styles.emptyCard}>
          <AppText variant="bodyStrong">No plan yet</AppText>
          <AppText variant="caption" style={{ marginTop: Spacing.one }}>
            Tap refresh to generate your first daily nutrition plan.
          </AppText>
        </AppCard>
      ) : null}

      {hasMeals ? (
        MEAL_ORDER.filter((mt) => grouped[mt]?.length).map((mealType) => (
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
        ))
      ) : !error ? (
        <AppCard style={styles.emptyCard}>
          <AppText variant="bodyStrong">Food database empty</AppText>
          <AppText variant="caption" style={{ marginTop: Spacing.one }}>
            Run backend migrations, then refresh — the API seeds Ethiopian foods on first request.
          </AppText>
        </AppCard>
      ) : null}

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

function TargetPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
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
  subtitle: { color: Colors.light.textSecondary, marginBottom: Spacing.three },
  errorCard: { marginBottom: Spacing.three, gap: Spacing.one, borderColor: Colors.light.error },
  planCard: { marginTop: Spacing.three, gap: Spacing.two },
  planText: { lineHeight: 22 },
  targetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    gap: 2,
  },
  emptyCard: { marginTop: Spacing.three, gap: Spacing.one },
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
