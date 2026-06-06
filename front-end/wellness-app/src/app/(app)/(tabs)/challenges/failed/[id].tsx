import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Challenge } from '@/lib/api/types';

export default function ChallengeFailed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [restarting, setRestarting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.challenges
      .progress(id)
      .then(setChallenge)
      .catch(() => setChallenge(null))
      .finally(() => setLoading(false));
  }, [id]);

  const qualifying = challenge?.progress_json?.qualifying_days ?? challenge?.progress ?? 0;
  const required = challenge?.progress_json?.required_days ?? challenge?.duration_days ?? 0;

  const handleRestart = useCallback(async () => {
    if (!id) return;
    setRestarting(true);
    try {
      const started = await api.challenges.start(id);
      const challengeId = String(started.challenge_id ?? started.id ?? id);
      replace(`/(app)/(tabs)/challenges/${challengeId}`);
    } catch {
      setRestarting(false);
    }
  }, [id]);

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.content}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.content}>
        <AppText variant="subtitle">Almost there</AppText>
        <AppText variant="caption" style={{ marginTop: Spacing.three, textAlign: 'center' }}>
          {required > 0
            ? `You completed ${qualifying} of ${required} days. Every attempt builds habit  ready to try again?`
            : 'Every attempt builds habit  ready to try again?'}
        </AppText>
        <AppButton
          label="Restart challenge"
          onPress={handleRestart}
          disabled={restarting}
          style={{ marginTop: Spacing.five }}
        />
        <AppButton
          label="Browse other challenges"
          variant="ghost"
          onPress={() => replace('/(app)/(tabs)/challenges')}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
});
