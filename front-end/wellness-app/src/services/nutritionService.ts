import { api } from '@/lib/api';
import type { Food, NutritionPlan } from '@/lib/api/types';
import { fetchFoods } from '@/services/profileService';

export type NutritionLanguage = 'en' | 'am';

export type DailyNutritionPlan = {
  plan: NutritionPlan;
  recommendedFoods: Food[];
};

function selectRecommendedFoods(planText: string, foods: Food[]): Food[] {
  const normalizedPlan = planText.toLocaleLowerCase();
  const mentioned = foods.filter((food) => {
    const names = [food.name, food.name_am].filter(Boolean) as string[];
    return names.some((name) => normalizedPlan.includes(name.toLocaleLowerCase()));
  });

  if (mentioned.length > 0) return mentioned.slice(0, 12);

  const selected: Food[] = [];
  for (const mealType of ['breakfast', 'lunch', 'dinner']) {
    const mealFoods = foods.filter((food) => food.meal_type.includes(mealType)).slice(0, 3);
    selected.push(...mealFoods);
  }
  return Array.from(new Map(selected.map((food) => [food.id, food])).values()).slice(0, 9);
}

export async function fetchDailyNutritionPlan(
  language: NutritionLanguage = 'en',
): Promise<DailyNutritionPlan> {
  const [plan, foods] = await Promise.all([
    api.nutrition.dailyPlan(language),
    fetchFoods(),
  ]);

  return {
    plan,
    recommendedFoods: selectRecommendedFoods(plan.plan, foods),
  };
}
