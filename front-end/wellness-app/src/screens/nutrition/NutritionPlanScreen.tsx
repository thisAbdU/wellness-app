import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LanguagePicker } from '@/components/features/onboarding/LanguagePicker';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLocalization } from '@/hooks/useLocalization';
import { navigate } from '@/lib/router';
import type { Food } from '@/lib/api/types';
import {
  fetchDailyNutritionPlan,
  type DailyNutritionPlan,
  type NutritionLanguage,
} from '@/services/nutritionService';

export function NutritionPlanScreen() {
  const { locale } = useLocalization();
  const [language, setLanguage] = useState<NutritionLanguage>(locale === 'am' ? 'am' : 'en');
  const [data, setData] = useState<DailyNutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setData(await fetchDailyNutritionPlan(language));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not generate a nutrition plan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [language]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="Nutrition" showMenu />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} size="large" />
          <AppText variant="caption">Generating your daily nutrition plan...</AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Nutrition" showMenu />
      <LanguagePicker value={language} onChange={setLanguage} />
      <View style={styles.refreshRow}>
        <AppButton
          label="Refresh plan"
          variant="primary"
          onPress={() => load(true)}
          loading={refreshing}
          style={styles.refresh}
        />
        <AppButton
          label="Regenerate (full)"
          variant="ghost"
          onPress={() => { setData(null); load(true); }}
          style={styles.regenerate}
        />
      </View>

      {error ? (
        <AppCard style={styles.errorCard}>
          <AppText variant="bodyStrong">Plan unavailable</AppText>
          <AppText variant="caption">{error}</AppText>
          <AppText variant="caption">
            Confirm the backend is running and GEMINI_API_KEY is configured.
          </AppText>
          <AppButton label="Try again" onPress={() => load(true)} />
        </AppCard>
      ) : null}

      {data ? (
        <>
          <AppText variant="overline" style={styles.section}>Daily plan</AppText>
          <AppCard style={styles.planCard}>
            {/* Parse plan into meal sections if possible */}
            {renderPlanAsMeals(data.plan.plan)}
          </AppCard>

          <AppText variant="overline" style={styles.section}>Calories</AppText>
          <View style={styles.calories}>
            <CalorieCard label="Minimum" value={data.plan.targets.calories_min} />
            <CalorieCard label="Maximum" value={data.plan.targets.calories_max} />
            <CalorieCard label="TDEE" value={data.plan.targets.tdee} />
          </View>

          <View style={styles.sectionHeader}>
            <AppText variant="overline">Recommended foods</AppText>
            <AppText variant="caption">{data.plan.food_pool_size} foods considered</AppText>
          </View>
          {data.recommendedFoods.length > 0 ? (
            data.recommendedFoods.map((food) => (
              <FoodCard key={food.id} food={food} language={language} />
            ))
          ) : (
            <AppText variant="caption">
              The generated plan did not include structured food recommendations.
            </AppText>
          )}
        </>
      ) : null}

      <View style={styles.links}>
        <AppButton
          label="Nutrition history"
          variant="ghost"
          onPress={() => navigate('/(app)/(tabs)/nutrition/history')}
        />
        <AppButton
          label="Goals & preferences"
          variant="ghost"
          onPress={() => navigate('/(app)/(tabs)/nutrition/goals')}
        />
      </View>
    </AppScreen>
  );
}

function CalorieCard({ label, value }: { label: string; value: number }) {
  return (
    <AppCard style={styles.calorieCard}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="subtitle">{Math.round(value)}</AppText>
      <AppText variant="caption">kcal</AppText>
    </AppCard>
  );
}

function FoodCard({ food, language }: { food: Food; language: NutritionLanguage }) {
  const name = language === 'am' && food.name_am ? food.name_am : food.name;
  return (
    <AppCard style={styles.foodCard}>
      <View style={styles.foodDetails}>
        <AppText variant="bodyStrong">{name}</AppText>
        <AppText variant="caption">
          Protein {food.protein_g}g · Carbs {food.carbs_g}g · Fat {food.fat_g}g
        </AppText>
      </View>
      <View style={styles.kcalBadge}>
        <AppText variant="bodyStrong" color={Colors.light.primary}>
          {Math.round(food.calories)}
        </AppText>
        <AppText variant="caption">kcal</AppText>
      </View>
    </AppCard>
  );
}

function renderPlanAsMeals(planText: string) {
  // Try to split by common meal headings
  const sections = planText.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  // If the plan contains explicit meal labels, prefer those
  const mealRegex = /^(Breakfast|Lunch|Dinner|Snack|Overall)[:\-]\s*/i;

  return (
    <View>
      {sections.map((sec, idx) => {
        const parts = sec.split(/[:\-]\s*/);
        const maybeLabel = parts[0].match(/^(Breakfast|Lunch|Dinner|Snack|Overall)/i);
        const label = maybeLabel ? maybeLabel[0] : null;
        const content = maybeLabel ? sec.replace(new RegExp(`^${label}[:\-]?\s*`, 'i'), '') : sec;
        return (
          <View key={idx} style={styles.mealBlock}>
            {label ? (
              <AppText variant="bodyStrong" style={styles.mealLabel}>{label}</AppText>
            ) : null}
            <AppText variant="body" style={styles.mealContent}>{content}</AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  refresh: { marginTop: Spacing.three },
  errorCard: { gap: Spacing.two, marginTop: Spacing.four },
  section: { marginTop: Spacing.four, marginBottom: Spacing.two },
  sectionHeader: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  planCard: { gap: Spacing.two },
  calories: { flexDirection: 'row', gap: Spacing.two },
  calorieCard: { flex: 1, alignItems: 'center', padding: Spacing.three },
  foodCard: {
    marginBottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  foodDetails: { flex: 1, gap: Spacing.one },
  kcalBadge: {
    minWidth: 58,
    padding: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
  },
  links: { gap: Spacing.two, marginTop: Spacing.four },
  refreshRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  regenerate: { marginLeft: Spacing.two },
  mealBlock: { marginBottom: Spacing.two, paddingBottom: Spacing.two, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  mealLabel: { marginBottom: Spacing.one, color: Colors.light.primary },
  mealContent: { lineHeight: 20 },
});
