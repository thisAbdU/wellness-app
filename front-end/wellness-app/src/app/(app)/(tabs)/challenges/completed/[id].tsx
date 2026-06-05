import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Challenge } from '@/lib/api/types';
import { useLocalization } from '@/hooks/useLocalization';

export default function ChallengeCompleted() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale } = useLocalization();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.challenges
      .progress(id)
      .then(setChallenge)
      .catch(() => setChallenge(null))
      .finally(() => setLoading(false));
  }, [id]);

  const title =
    challenge &&
    (locale === 'am' && challenge.title_am
      ? challenge.title_am
      : (challenge.title ?? 'Challenge'));

  const handleShare = useCallback(async () => {
    const name = title ?? 'my BIRTU challenge';
    const required = challenge?.progress_json?.required_days ?? challenge?.duration_days ?? '';
    await Share.share({
      message: `I completed the "${name}" challenge (${required} days) on BIRTU! 🎉`,
    });
  }, [title, challenge]);

  if (loading) {
    return (
      <AppScreen scrollable={false} style={styles.wrap}>
        <ActivityIndicator color={Colors.light.primary} />
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable={false} style={styles.wrap}>
      <AppText style={styles.confetti}>🎉</AppText>
      <AppText variant="title" align="center">
        Challenge complete!
      </AppText>
      <AppText variant="caption" align="center" style={{ marginTop: Spacing.two }}>
        {title ? `You finished "${title}"` : 'Great work — badge unlocked!'}
      </AppText>
      <View style={styles.badge}>
        <AppText style={{ fontSize: 64 }}>🏅</AppText>
      </View>
      <AppButton label="Share achievement" variant="secondary" onPress={handleShare} />
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
