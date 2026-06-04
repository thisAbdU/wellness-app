import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { LanguagePicker } from '@/components/features/onboarding/LanguagePicker';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Phase = 'idle' | 'recording' | 'processing' | 'response';

export default function VoiceCoachScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const [seconds, setSeconds] = useState(0);
  const pulse = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (phase !== 'recording') return;
    const iv = setInterval(() => setSeconds((s) => Math.min(120, s + 1)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase === 'recording' || phase === 'idle') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [phase, pulse]);

  const startRecording = () => {
    setSeconds(0);
    setPhase('recording');
  };

  const stopRecording = () => {
    setPhase('processing');
    setTimeout(() => setPhase('response'), 2000);
  };

  return (
    <AppScreen scrollable={false}>
      <ScreenHeader
        title="Voice coach"
        showBack
        right={
          <Pressable onPress={() => navigate('/(app)/voice-coach/history')}>
            <AppText variant="link">History</AppText>
          </Pressable>
        }
      />
      <LanguagePicker value={lang} onChange={setLang} />
      <AppText variant="caption" align="center" style={{ marginVertical: Spacing.three }}>
        Ask your health coach anything.
      </AppText>

      {phase === 'processing' ? (
        <View style={styles.center}>
          <AppText variant="bodyStrong">Processing…</AppText>
          <AppText variant="caption" style={{ marginTop: Spacing.three }}>
            Transcribing: &quot;How can I sleep better this week?&quot;
          </AppText>
        </View>
      ) : phase === 'response' ? (
        <View style={styles.center}>
          <AppText variant="overline">You asked</AppText>
          <AppText variant="body">How can I sleep better this week?</AppText>
          <AppText variant="overline" style={{ marginTop: Spacing.four }}>
            Coach
          </AppText>
          <AppText variant="body">
            Try a consistent bedtime and avoid screens 30 minutes before sleep. Your data shows
            better rest after light evening activity.
          </AppText>
          <AppButton label="▶ Play response" variant="secondary" onPress={() => {}} />
          <AppButton label="Save this insight" onPress={() => {}} />
          <AppButton label="Ask another question" variant="ghost" onPress={() => setPhase('idle')} />
        </View>
      ) : (
        <View style={styles.center}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Pressable
              style={[styles.mic, phase === 'recording' && styles.micActive]}
              onPress={phase === 'recording' ? stopRecording : startRecording}
            >
              <AppText style={{ fontSize: 40 }}>🎙️</AppText>
            </Pressable>
          </Animated.View>
          {phase === 'recording' ? (
            <>
              <AppText variant="bodyStrong">{seconds}s / 120s max</AppText>
              <AppButton label="Stop" onPress={stopRecording} style={{ marginTop: Spacing.four }} />
            </>
          ) : (
            <AppText variant="caption">Tap to start speaking</AppText>
          )}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  mic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  micActive: {
    backgroundColor: Colors.light.primary,
  },
});
