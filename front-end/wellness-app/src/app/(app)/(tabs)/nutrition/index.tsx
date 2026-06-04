import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MOCK_MEALS } from '@/constants/mockData';

export default function NutritionDailyPlan() {
  const router = useRouter();

  return (
    <AppScreen>
      <ScreenHeader title="Nutrition" showMenu />
      <AppButton label="Refresh plan" variant="secondary" onPress={() => {}} />
      {MOCK_MEALS.map((meal) => (
        <TouchableOpacity
          key={meal.id}
          onPress={() => navigate(`/(app)/(tabs)/nutrition/meal/${meal.id}`)}
        >
          <AppCard style={styles.meal}>
            <AppText variant="overline">{meal.type}</AppText>
            <AppText variant="bodyStrong">{meal.nameEn}</AppText>
            <AppText variant="caption">{meal.nameAm}</AppText>
            <View style={styles.macros}>
              <MacroBar label="P" value={meal.protein} color={Colors.light.primary} />
              <MacroBar label="C" value={meal.carbs} color={Colors.light.accentPurple} />
              <MacroBar label="F" value={meal.fat} color={Colors.light.warning} />
            </View>
            <AppText variant="caption">{meal.calories} kcal</AppText>
          </AppCard>
        </TouchableOpacity>
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
      <View style={[styles.macroFill, { backgroundColor: color, width: `${Math.min(value, 50)}%` }]} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  meal: { marginTop: Spacing.three, gap: Spacing.one },
  macros: { flexDirection: 'row', gap: Spacing.two, marginVertical: Spacing.two },
  macroCol: { flex: 1, height: 6, backgroundColor: Colors.light.border, borderRadius: Radius.sm, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: Radius.sm },
});
