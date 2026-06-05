import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { fetchEmergencyContacts } from '@/services/profileService';

export default function SosModal() {
  const router = useRouter();
  const { user } = useAuth();
  const [count, setCount] = useState(3);
  const [contactName, setContactName] = useState('your emergency contact');
  const [sending, setSending] = useState(false);
  const sentRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchEmergencyContacts(user.id).then((contacts) => {
      if (contacts[0]?.name) setContactName(contacts[0].name);
    });
  }, [user?.id]);

  useEffect(() => {
    if (count > 0 || sentRef.current) return;

    sentRef.current = true;
    setSending(true);

    (async () => {
      try {
        let lat: number | undefined;
        let lng: number | undefined;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }

        const result = await api.emergency.notify(lat, lng);
        Alert.alert(
          'Alert sent',
          `Emergency notification sent to ${contactName}.${result.queued ? ` (${result.queued} queued)` : ''}`,
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } catch (e) {
        Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send alert', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } finally {
        setSending(false);
      }
    })();
  }, [count, contactName, router]);

  useEffect(() => {
    if (count <= 0 || sending) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, sending]);

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <AppText variant="subtitle" align="center">
            Send emergency alert to {contactName}?
          </AppText>
          <AppText
            variant="title"
            align="center"
            color={Colors.light.error}
            style={{ marginVertical: Spacing.four }}
          >
            {count > 0 ? count : sending ? 'Sending…' : 'Sent'}
          </AppText>
          <AppText variant="caption" align="center">
            {count > 0
              ? `Auto-confirms in ${count} seconds unless cancelled. Your location will be shared.`
              : 'Notifying your emergency contact with GPS location.'}
          </AppText>
          <AppButton
            label="Cancel"
            variant="secondary"
            onPress={() => router.back()}
            disabled={sending}
            style={{ marginTop: Spacing.four }}
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
    justifyContent: 'center',
    padding: Spacing.four,
  },
  sheet: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.xl,
    padding: Spacing.four,
  },
});
