import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AppCard } from '@/components/ui/AppCard';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAiInsights } from '@/services/profileService';
import type { AiInsight } from '@/lib/api/types';

function parseInsight(content: string): { q: string; a: string } {
  try {
    const parsed = JSON.parse(content) as { question?: string; answer?: string };
    return {
      q: parsed.question ?? 'Question',
      a: parsed.answer ?? content,
    };
  } catch {
    return { q: 'Insight', a: content };
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function VoiceCoachHistory() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const all = await fetchAiInsights(user.id);
      setInsights(all.filter((i) => i.insight_type === 'voice_coach'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppScreen>
      <ScreenHeader title="Saved insights" showBack />
      {loading ? (
        <ActivityIndicator color={Colors.light.primary} style={{ marginTop: Spacing.four }} />
      ) : insights.length === 0 ? (
        <AppText variant="caption" align="center" style={{ marginTop: Spacing.four }}>
          No saved insights yet. Ask your voice coach a question and tap Save.
        </AppText>
      ) : (
        insights.map((item) => {
          const { q, a } = parseInsight(item.content);
          return (
            <AppCard key={item.id} style={styles.card}>
              <AppText variant="overline">{formatDate(item.created_at)}</AppText>
              <AppText variant="bodyStrong">{q}</AppText>
              <AppText variant="caption">{a}</AppText>
              <Pressable style={styles.replay}>
                <AppText variant="link">View details</AppText>
              </Pressable>
            </AppCard>
          );
        })
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.three, gap: Spacing.one },
  replay: { marginTop: Spacing.two },
});
