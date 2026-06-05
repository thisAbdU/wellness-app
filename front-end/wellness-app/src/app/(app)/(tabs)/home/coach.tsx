import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Audio } from 'expo-av';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type InsightResponse = {
  insight_type: string;
  insight: string;
  audio_url?: string | null;
  tts_available?: boolean;
};

export default function CoachExpanded() {
  const { user, isLoading: authLoading } = useAuth();
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const loadInsight = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    setError(null);
    try {
      if (!user?.id) throw new Error('Not signed in');
      const data = await api.coach.insight('DAILY_NUDGE');
      setInsight(data as InsightResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load insight');
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.id]);

  useEffect(() => {
    loadInsight();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [loadInsight]);

  const togglePlayback = async () => {
    const audioUrl = insight?.audio_url;
    if (!audioUrl) return;

    try {
      if (playing && soundRef.current) {
        await soundRef.current.pauseAsync();
        setPlaying(false);
        return;
      }

      setAudioLoading(true);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
        }
      });
      await sound.playAsync();
      setPlaying(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to play audio');
    } finally {
      setAudioLoading(false);
    }
  };

  const hasAudio = Boolean(insight?.audio_url);

  return (
    <AppScreen>
      <ScreenHeader title="AI Coach" showBack />
      <View style={styles.card}>
        <AppText variant="overline" color={Colors.light.primary}>
          Today&apos;s insight
        </AppText>
        {loading ? (
          <AppText variant="caption" style={{ marginTop: Spacing.three }}>
            Loading your daily nudge…
          </AppText>
        ) : error ? (
          <AppText variant="caption" color={Colors.light.error} style={{ marginTop: Spacing.three }}>
            {error}
          </AppText>
        ) : (
          <AppText variant="body" style={{ marginTop: Spacing.three, lineHeight: 24 }}>
            {insight?.insight ?? 'No insight available yet. Check back after syncing health data.'}
          </AppText>
        )}
      </View>

      {error && !loading ? (
        <AppButton
          label="Retry"
          variant="ghost"
          onPress={loadInsight}
          loading={loading}
          style={{ marginBottom: Spacing.three }}
        />
      ) : null}

      {hasAudio ? (
        <AppButton
          label={playing ? 'Pause voice' : '▶ Play insight (TTS)'}
          variant="secondary"
          onPress={togglePlayback}
          loading={audioLoading}
          style={{ marginBottom: Spacing.three }}
        />
      ) : null}

      <AppButton
        label="More insights"
        variant="ghost"
        onPress={() => navigate('/(app)/voice-coach/history')}
      />
      <AppButton
        label="Ask with voice"
        onPress={() => navigate('/(app)/voice-coach')}
        style={{ marginTop: Spacing.three }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
  },
});
