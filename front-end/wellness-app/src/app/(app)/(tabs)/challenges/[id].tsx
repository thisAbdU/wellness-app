import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Colors, Spacing } from '@/constants/theme';

export default function ChallengeDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppScreen>
      <ScreenHeader title="10K Steps Daily" showBack />
      <View style={styles.center}>
        <ProgressRing progress={0.57} size={140} label="8/14" sublabel="days" />
      </View>
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        Challenge {id}: Walk at least 10,000 steps each day for 14 days.
      </AppText>
      <AppText variant="body" style={styles.motivation}>
        You&apos;re past the halfway mark — keep your evening walks going!
      </AppText>
      <View style={styles.miniCal}>
        {Array.from({ length: 14 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.day,
              { backgroundColor: i < 8 ? Colors.light.primary : Colors.light.border },
            ]}
          />
        ))}
      </View>
      <AppButton
        label="Abandon challenge"
        variant="ghost"
        onPress={() => navigate(`/(app)/(tabs)/challenges/failed/${id}`)}
        style={{ marginTop: Spacing.four }}
      />
      <AppButton
        label="Mark complete (demo)"
        onPress={() => navigate(`/(app)/(tabs)/challenges/completed/${id}`)}
        style={{ marginTop: Spacing.two }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: Spacing.four },
  motivation: { fontStyle: 'italic', marginBottom: Spacing.three },
  miniCal: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  day: { width: 20, height: 20, borderRadius: 4 },
});
