import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { SosCountdownButton } from '@/components/SosCountdownButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { Colors, Spacing } from '@/constants/theme';
import { fetchEmergencyContacts } from '@/services/emergencyContactService';
import { sendEmergencyAlertWithLocation } from '@/services/emergencyService';

type Status = 'idle' | 'sending' | 'success' | 'error';

export function SosScreen() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('Your alert will be sent after the countdown finishes.');
  const [contactCount, setContactCount] = useState<number | null>(null);

  useEffect(() => {
    fetchEmergencyContacts()
      .then((contacts) => setContactCount(contacts.length))
      .catch(() => setContactCount(null));
  }, []);

  const sendAlert = useCallback(async () => {
    setStatus('sending');
    setMessage('Getting your location and notifying your emergency contacts...');

    try {
      const result = await sendEmergencyAlertWithLocation();
      setStatus('success');
      setMessage(
        result.queued > 0
          ? `Emergency alert sent. ${result.queued} notification${result.queued === 1 ? '' : 's'} queued${result.locationShared ? ' with your location' : ' without location access'}.`
          : 'The request completed, but no emergency contacts are currently on file.',
      );
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to send the emergency alert.');
    }
  }, []);

  return (
    <AppScreen>
      <ScreenHeader title="SOS" showBack />
      <AppText variant="subtitle" align="center">
        Emergency assistance
      </AppText>
      <AppText variant="caption" align="center" style={styles.description}>
        Tap SOS to begin a five-second countdown. Tap the button again before it ends to cancel.
      </AppText>

      <SosCountdownButton onCountdownComplete={sendAlert} disabled={status === 'sending'} />

      <AppCard subtle style={styles.statusCard}>
        <View style={styles.statusRow}>
          {status === 'sending' ? <ActivityIndicator color={Colors.light.primary} /> : null}
          <View style={styles.statusText}>
            <AppText variant="bodyStrong" color={status === 'error' ? Colors.light.error : undefined}>
              {message}
            </AppText>
          </View>
        </View>
        {contactCount !== null ? (
          <AppText variant="caption" style={styles.contactText}>
            {contactCount} emergency contact{contactCount === 1 ? '' : 's'} saved.
          </AppText>
        ) : null}
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  description: {
    marginTop: Spacing.two,
  },
  statusCard: {
    marginTop: Spacing.two,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    flex: 1,
    paddingLeft: Spacing.two,
  },
  contactText: {
    marginTop: Spacing.two,
  },
});
