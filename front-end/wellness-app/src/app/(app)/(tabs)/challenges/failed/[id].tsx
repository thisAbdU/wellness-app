import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Spacing } from '@/constants/theme';

export default function ChallengeFailed() {
  const router = useRouter();

  return (
    <AppScreen>
      <View style={styles.content}>
        <AppText variant="subtitle">Almost there</AppText>
        <AppText variant="caption" style={{ marginTop: Spacing.three, textAlign: 'center' }}>
          You completed 8 of 14 days. Every attempt builds habit — ready to try again?
        </AppText>
        <AppButton label="Restart challenge" onPress={() => router.back()} style={{ marginTop: Spacing.five }} />
        <AppButton label="Browse other challenges" variant="ghost" onPress={() => replace('/(app)/(tabs)/challenges')} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
});
