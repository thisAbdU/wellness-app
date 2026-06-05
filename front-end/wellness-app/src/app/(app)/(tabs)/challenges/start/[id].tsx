import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { replace } from '@/lib/router';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { fetchChallengeTemplates } from '@/services/profileService';
import { useLocalization } from '@/hooks/useLocalization';

export default function ChallengeStartModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale } = useLocalization();
  const [template, setTemplate] = useState<Record<string, unknown> | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchChallengeTemplates()
      .then((templates) => templates.find((t) => String(t.id) === id) ?? null)
      .then(setTemplate)
      .catch(() => setTemplate(null));
  }, [id]);

  const handleStart = useCallback(async () => {
    if (!id) return;
    setStarting(true);
    try {
      const challenge = await api.challenges.start(id);
      const challengeId = String(challenge.challenge_id ?? challenge.id ?? id);
      replace(`/(app)/(tabs)/challenges/${challengeId}`);
    } catch {
      setStarting(false);
    }
  }, [id]);

  const title =
    template &&
    (locale === 'am' && template.title_am
      ? String(template.title_am)
      : String(template.title ?? 'Challenge'));

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <AppText variant="subtitle">Start challenge?</AppText>
          {template ? (
            <>
              <AppText variant="bodyStrong" style={{ marginTop: Spacing.two }}>
                {title}
              </AppText>
              <AppText variant="caption" style={{ marginVertical: Spacing.three }}>
                {String(template.description ?? '')}
              </AppText>
              <AppText variant="caption">
                {String(template.duration_days)} days · {String(template.metric)} ≥{' '}
                {String(template.target_value)}
              </AppText>
            </>
          ) : (
            <ActivityIndicator color={Colors.light.primary} style={{ marginVertical: Spacing.four }} />
          )}
          <AppButton
            label="Start Challenge"
            onPress={handleStart}
            disabled={starting || !template}
            style={{ marginTop: Spacing.four }}
          />
          <AppButton label="Cancel" variant="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.light.backgroundElement,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
});
