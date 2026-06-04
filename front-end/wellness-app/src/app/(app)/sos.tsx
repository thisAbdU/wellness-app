import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function SosModal() {
  const router = useRouter();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) {
      router.back();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, router]);

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <AppText variant="subtitle" align="center">
            Send emergency alert to Mom?
          </AppText>
          <AppText variant="title" align="center" color={Colors.light.error} style={{ marginVertical: Spacing.four }}>
            {count > 0 ? count : 'Sending…'}
          </AppText>
          <AppText variant="caption" align="center">
            Auto-confirms in {count} seconds unless cancelled.
          </AppText>
          <AppButton label="Cancel" variant="secondary" onPress={() => router.back()} style={{ marginTop: Spacing.four }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.overlay,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  sheet: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.xl,
    padding: Spacing.four,
  },
});
