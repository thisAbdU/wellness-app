import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { Spacing } from '@/constants/theme';
import { syncManualWorkout } from '@/services/healthSyncService';

export default function ManualEntry() {
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const durationMin = parseInt(duration, 10);
    if (!workoutType.trim()) {
      Alert.alert('Missing info', 'Enter a workout type.');
      return;
    }
    if (!durationMin || durationMin <= 0) {
      Alert.alert('Missing info', 'Enter a valid duration in minutes.');
      return;
    }

    setSaving(true);
    try {
      await syncManualWorkout(workoutType.trim(), durationMin);
      navigate('/(app)/(tabs)/activity');
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Could not save workout.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title="Manual entry" showBack />
      <View style={styles.form}>
        <AuthTextField
          label="Workout type"
          value={workoutType}
          onChangeText={setWorkoutType}
          placeholder="Run, Walk..."
        />
        <AuthTextField
          label="Duration (min)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />
        <AppButton label="Save entry" onPress={handleSave} loading={saving} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three, marginTop: Spacing.two },
});
