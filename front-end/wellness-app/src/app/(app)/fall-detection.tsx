import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { navigate } from '@/lib/router';

const FALL_THRESHOLD = 2.8;
const COOLDOWN_MS = 30000;

export default function FallDetectionModal() {
  const router = useRouter();
  const [count, setCount] = useState(15);
  const [active, setActive] = useState(false);
  const lastFallRef = useRef(0);
  const dismissedRef = useRef(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      if (dismissedRef.current || active) return;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > FALL_THRESHOLD && now - lastFallRef.current > COOLDOWN_MS) {
        lastFallRef.current = now;
        setActive(true);
        setCount(15);
      }
    });
    return () => sub.remove();
  }, [active]);

  useEffect(() => {
    if (!active || count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [active, count]);

  useEffect(() => {
    if (!active || count > 0) return;
    router.back();
    navigate('/(app)/sos');
  }, [active, count, router]);

  const handleOk = () => {
    dismissedRef.current = true;
    setActive(false);
    router.back();
  };

  if (!active) {
    return (
      <Modal transparent animationType="fade" visible>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <AppText variant="title" align="center">
              Fall detection active
            </AppText>
            <AppText variant="caption" align="center" style={{ marginVertical: Spacing.three }}>
              Monitoring for sudden movements. Keep the app open while active.
            </AppText>
            <Pressable style={styles.okBtn} onPress={() => router.back()}>
              <AppText variant="bodyStrong" color="#fff">
                Stop monitoring
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

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
          <Pressable style={styles.okBtn} onPress={handleOk}>
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
