import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SimpleBarChart } from '@/components/ui/SimpleBarChart';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function MetricsHistory() {
  const { profile, isLoading } = useAuth();
  const weight = profile?.weight_kg;

  if (isLoading) {
    return (
      <AppScreen>
        <ScreenHeader title="Weight history" showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  const chartData = weight ? [weight * 10] : [];

  return (
    <AppScreen>
      <ScreenHeader title="Weight history" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.three }}>
        Tap a point for logged value and date.
      </AppText>
      {weight ? (
        <>
          <SimpleBarChart data={chartData} />
          <View style={{ marginTop: Spacing.four }}>
            <AppText variant="bodyStrong">Latest: {weight} kg</AppText>
            <AppText variant="caption">From your profile</AppText>
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <AppText variant="bodyStrong">No weight logged yet</AppText>
          <AppText variant="caption">Update your weight in Edit profile to track it here.</AppText>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
  empty: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
