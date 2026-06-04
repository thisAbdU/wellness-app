import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function CoachExpanded() {
  const router = useRouter();
  const [playing, setPlaying] = useState(false);

  return (
    <AppScreen>
      <ScreenHeader title="AI Coach" showBack />
      <View style={styles.card}>
        <AppText variant="overline" color={Colors.light.primary}>
          Today&apos;s insight
        </AppText>
        <AppText variant="body" style={{ marginTop: Spacing.three, lineHeight: 24 }}>
          Your sleep improved on days you logged evening walks. Consider a 20-minute walk
          after dinner this week — it may help recovery without raising evening stress.
        </AppText>
      </View>
      <AppButton
        label={playing ? 'Pause voice' : '▶ Play insight (TTS)'}
        variant="secondary"
        onPress={() => setPlaying(!playing)}
        style={{ marginBottom: Spacing.three }}
      />
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
