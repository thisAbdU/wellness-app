import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function HealthAlertModal() {
  const router = useRouter();

  return (
    <Modal transparent animationType="slide" visible>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <AppText style={{ fontSize: 48, textAlign: 'center' }}>⚠️</AppText>
          <AppText variant="subtitle" align="center" style={{ marginTop: Spacing.three }}>
            Sleep trend alert
          </AppText>
          <AppText variant="body" style={{ marginVertical: Spacing.four }}>
            You&apos;ve averaged under 6 hours of sleep for 4 nights. This may affect recovery
            and mood — consider an earlier bedtime tonight.
          </AppText>
          <AppButton label="Dismiss" variant="ghost" onPress={() => router.back()} />
          <AppButton
            label="See recommendations"
            onPress={() => {
              router.back();
              navigate('/(app)/(tabs)/home/coach');
            }}
          />
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
