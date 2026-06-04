import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/theme';

export default function ChallengeCompleted() {
  const router = useRouter();

  return (
    <AppScreen scrollable={false} style={styles.wrap}>
      <AppText style={styles.confetti}>🎉</AppText>
      <AppText variant="title" align="center">
        Challenge complete!
      </AppText>
      <AppText variant="caption" align="center" style={{ marginTop: Spacing.two }}>
        You earned the Step Master badge
      </AppText>
      <View style={styles.badge}>
        <AppText style={{ fontSize: 64 }}>🏅</AppText>
      </View>
      <AppButton label="Share achievement" variant="secondary" onPress={() => {}} />
      <AppButton
        label="View badge in collection"
        onPress={() => navigate('/(app)/profile/badges')}
        style={{ marginTop: Spacing.three }}
      />
      <AppButton label="Done" variant="ghost" onPress={() => router.back()} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center', padding: Spacing.four },
  confetti: { fontSize: 48, marginBottom: Spacing.four },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.five,
  },
});
