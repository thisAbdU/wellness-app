import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function ProfileStep2() {
  const router = useRouter();
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('72');
  const h = parseInt(height, 10) || 175;
  const w = parseInt(weight, 10) || 72;
  const scale = Math.min(1.2, Math.max(0.8, w / 70));

  return (
    <AuthCardLayout>
      <AuthHeader title="Body metrics" subtitle="Step 2 of 6" />
      <View style={styles.silhouette}>
        <View
          style={[
            styles.body,
            {
              height: 80 + (h - 150) * 0.4,
              transform: [{ scaleX: scale }],
            },
          ]}
        />
        <AppText variant="caption">
          {h} cm · {w} kg
        </AppText>
      </View>
      <AuthTextField label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
      <AuthTextField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <AppButton label="Continue" onPress={() => navigate('/(auth)/profile-setup/step-3')} />
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  silhouette: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.lg,
    marginBottom: Spacing.three,
  },
  body: {
    width: 48,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    marginBottom: Spacing.two,
  },
});
