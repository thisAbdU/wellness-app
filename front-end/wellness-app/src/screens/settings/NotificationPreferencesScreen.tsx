import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { Colors, Spacing } from '@/constants/theme';
import type { NotificationPreferences } from '@/lib/api/types';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  fetchNotificationPreferences,
  saveNotificationPreferences,
} from '@/services/notificationPreferenceService';

const OPTIONS: Array<{
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}> = [
  { key: 'challenge_updates', label: 'Challenge updates', description: 'Progress and completion updates.' },
  { key: 'badge_alerts', label: 'Badge alerts', description: 'Know when you earn a new badge.' },
  { key: 'coach_insights', label: 'Coach insights', description: 'AI coach tips and weekly insights.' },
  { key: 'emergency_alerts', label: 'Emergency alerts', description: 'Important safety notifications.' },
  { key: 'leaderboard_updates', label: 'Leaderboard updates', description: 'Changes to your leaderboard position.' },
  { key: 'daily_reminders', label: 'Daily reminders', description: 'Daily wellness check-in reminders.' },
];

export function NotificationPreferencesScreen() {
  const [preferences, setPreferences] = useState(DEFAULT_NOTIFICATION_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      setPreferences(await fetchNotificationPreferences());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load preferences.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      setPreferences(await saveNotificationPreferences(preferences));
      setMessage('Notification preferences saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Notifications" showBack />
      <AppText variant="caption" style={styles.intro}>
        Choose which wellness updates you would like to receive, then save your changes.
      </AppText>

      {loading ? (
        <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
      ) : (
        <AppCard padded={false}>
          {OPTIONS.map((option, index) => (
            <View key={option.key} style={[styles.row, index < OPTIONS.length - 1 && styles.border]}>
              <View style={styles.copy}>
                <AppText variant="bodyStrong">{option.label}</AppText>
                <AppText variant="caption">{option.description}</AppText>
              </View>
              <Switch
                value={preferences[option.key]}
                onValueChange={(value) => toggle(option.key, value)}
                trackColor={{ true: Colors.light.primary }}
              />
            </View>
          ))}
        </AppCard>
      )}

      {error ? <AppText color={Colors.light.error} style={styles.message}>{error}</AppText> : null}
      {message ? <AppText style={styles.message}>{message}</AppText> : null}

      <View style={styles.actions}>
        <AppButton label="Save preferences" onPress={save} loading={saving} disabled={loading} />
        <AppButton label="Refresh" variant="ghost" onPress={load} disabled={loading || saving} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: Spacing.four,
  },
  loader: {
    marginVertical: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  copy: {
    flex: 1,
    paddingRight: Spacing.three,
  },
  message: {
    marginTop: Spacing.three,
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
});
