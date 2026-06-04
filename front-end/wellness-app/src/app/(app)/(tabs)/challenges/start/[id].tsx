import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function ChallengeStartModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <AppText variant="subtitle">Start challenge?</AppText>
          <AppText variant="caption" style={{ marginVertical: Spacing.three }}>
            Based on your averages, this challenge is moderate difficulty. You&apos;ll need
            to hit the daily metric for the full duration.
          </AppText>
          <AppText variant="caption">Template: {id}</AppText>
          <AppButton
            label="Start Challenge"
            onPress={() => replace(`/(app)/(tabs)/challenges/${id}`)}
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
