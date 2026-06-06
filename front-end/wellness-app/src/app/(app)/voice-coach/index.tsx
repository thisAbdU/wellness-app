import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, Platform, StyleSheet, View } from 'react-native';
import { Audio } from 'expo-av';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { LanguagePicker } from '@/components/features/onboarding/LanguagePicker';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { saveAiInsight } from '@/services/profileService';
import type { VoiceCoachResult } from '@/lib/api/types';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';

type Phase = 'idle' | 'recording' | 'processing' | 'response';

export default function VoiceCoachScreen() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<VoiceCoachResult | null>(null);
  const [saving, setSaving] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Audio.requestPermissionsAsync();
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

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

  const startRecording = async () => {
    try {
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setSeconds(0);
      setResult(null);
      setPhase('recording');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not start recording');
    }
  };

const stopRecording = async () => {
  const recording = recordingRef.current;
  if (!recording) return;

  setPhase('processing');

  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recordingRef.current = null;

    if (!uri) throw new Error('No recording URI');

    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    const backendUrl = `http://${host}:8000/api/v1/coach/voice`;

    const filename = uri.split('/').pop() || `recording-${Date.now()}.wav`;
    const ext = (filename.split('.').pop() || '').toLowerCase();
    const mime =
      ext === 'm4a' ? 'audio/m4a' :
      ext === 'wav' ? 'audio/wav' :
      ext === 'mp3' ? 'audio/mpeg' :
      ext === 'aac' ? 'audio/aac' :
      'audio/webm'; // web default

    const { data: { session } } = await supabase.auth.getSession();

    const authHeader = session?.access_token
    ? `Bearer ${session.access_token}` : null;

    let json: any;

    if (Platform.OS === 'web') {
      // Web: fetch the blob URI and send via FormData
      const blobRes = await fetch(uri);
      const blob = await blobRes.blob();

      const formData = new FormData();
      formData.append('audio', blob, filename);
      formData.append('language', lang);
      

      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed (${res.status}): ${text}`);
      }

      json = await res.json();
    } else {
      // Native: use FileSystem.uploadAsync
      const uploadResult = await FileSystem.uploadAsync(backendUrl, uri, {
        fieldName: 'audio',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        parameters: { language: lang },
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      });

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        throw new Error(`Upload failed (${uploadResult.status}): ${uploadResult.body}`);
      }

      json = JSON.parse(uploadResult.body);
    }

    if (!json?.success) throw new Error(`Server error: ${JSON.stringify(json)}`);

    setResult(json.data ?? json);
    setPhase('response');
  } catch (e) {
    Alert.alert('Error', e instanceof Error ? e.message : 'Failed to process voice');
    setPhase('idle');
  }
};

  const playResponse = async () => {
    if (!result?.audio_url) {
      Alert.alert('No audio', 'Text-only response available.');
      return;
    }
    try {
      await soundRef.current?.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri: result.audio_url });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not play audio');
    }
  };

  const handleSave = async () => {
    if (!user?.id || !result) return;
    setSaving(true);
    try {
      const content = JSON.stringify({
        question: result.transcript,
        answer: result.response_text,
        language: result.language,
      });
      await saveAiInsight(user.id, 'voice_coach', content);
      Alert.alert('Saved', 'Insight saved to your history.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save insight');
    } finally {
      setSaving(false);
    }
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
            Transcribing your question…
          </AppText>
        </View>
      ) : phase === 'response' && result ? (
        <View style={styles.center}>
          <AppText variant="overline">You asked</AppText>
          <AppText variant="body">{result.transcript}</AppText>
          <AppText variant="overline" style={{ marginTop: Spacing.four }}>
            Coach
          </AppText>
          <AppText variant="body">{result.response_text}</AppText>
          {result.tts_available && result.audio_url ? (
            <AppButton label="▶ Play response" variant="secondary" onPress={playResponse} />
          ) : null}
          <AppButton label="Save this insight" onPress={handleSave} loading={saving} />
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
