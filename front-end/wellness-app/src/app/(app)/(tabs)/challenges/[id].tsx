import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Colors, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Challenge } from '@/lib/api/types';
import { useLocalization } from '@/hooks/useLocalization';

export default function ChallengeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale } = useLocalization();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.challenges.progress(id);
      if (data.status === 'completed') {
        replace(`/(app)/(tabs)/challenges/completed/${id}`);
        return;
      }
      if (data.status === 'failed') {
        replace(`/(app)/(tabs)/challenges/failed/${id}`);
        return;
      }
      setChallenge(data);
    } catch {
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="Challenge" showBack />
        <View style={styles.center}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  if (!challenge) {
    return (
      <AppScreen>
        <ScreenHeader title="Challenge" showBack />
        <AppText variant="caption">Challenge not found.</AppText>
      </AppScreen>
    );
  }

  const title =
    locale === 'am' && challenge.title_am ? challenge.title_am : (challenge.title ?? 'Challenge');
  const required = challenge.progress_json?.required_days ?? challenge.duration_days ?? 1;
  const qualifying = challenge.progress_json?.qualifying_days ?? challenge.progress ?? 0;
  const progress = required > 0 ? qualifying / required : 0;
  const log = challenge.progress_json?.log ?? {};
  const dayCount = required;

  return (
    <AppScreen>
      <ScreenHeader title={title} showBack />
      <View style={styles.center}>
        <ProgressRing
          progress={progress}
          size={140}
          label={`${qualifying}/${required}`}
          sublabel="days"
        />
      </View>
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        {challenge.description ?? `Hit ${challenge.target_value} ${challenge.metric} daily.`}
      </AppText>
      <AppText variant="body" style={styles.motivation}>
        {qualifying >= required / 2
          ? "You're past the halfway mark — keep going!"
          : 'Every qualifying day counts — stay consistent!'}
      </AppText>
      <View style={styles.miniCal}>
        {Array.from({ length: dayCount }).map((_, i) => {
          const dates = Object.keys(log).sort();
          const dayOk = dates[i] ? log[dates[i]] : i < qualifying;
          return (
            <View
              key={i}
              style={[
                styles.day,
                { backgroundColor: dayOk ? Colors.light.primary : Colors.light.border },
              ]}
            />
          );
        })}
      </View>
      <AppButton
        label="Abandon challenge"
        variant="ghost"
        onPress={() => navigate(`/(app)/(tabs)/challenges/failed/${id}`)}
        style={{ marginTop: Spacing.four }}
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
