import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { Spacing } from '@/constants/theme';

export default function ManualEntry() {
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');

  return (
    <AppScreen>
      <ScreenHeader title="Manual entry" showBack />
      <View style={styles.form}>
        <AuthTextField label="Steps" value={steps} onChangeText={setSteps} keyboardType="numeric" />
        <AuthTextField label="Sleep (hours)" value={sleep} onChangeText={setSleep} keyboardType="numeric" />
        <AuthTextField label="Workout type" value={workoutType} onChangeText={setWorkoutType} placeholder="Run, Walk..." />
        <AuthTextField label="Duration (min)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
        <AppButton label="Save entry" onPress={() => {}} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three, marginTop: Spacing.two },
});
