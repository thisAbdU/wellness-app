import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function FallDetectionModal() {
  const router = useRouter();
  const [count, setCount] = useState(15);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <AppText variant="title" align="center">
            Are you okay?
          </AppText>
          <AppText variant="caption" align="center" style={{ marginVertical: Spacing.three }}>
            Fall detected. Alert sends in {count}s unless dismissed.
          </AppText>
          <Pressable style={styles.okBtn} onPress={() => router.back()}>
            <AppText variant="bodyStrong" color="#fff">
              I&apos;m OK
            </AppText>
          </Pressable>
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
    padding: Spacing.five,
    alignItems: 'center',
  },
  okBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderRadius: Radius.pill,
    marginTop: Spacing.four,
    minWidth: 200,
    alignItems: 'center',
  },
});
