import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchEmergencyContacts,
  saveEmergencyContact,
} from '@/services/profileService';
import { api } from '@/lib/api';

export default function EmergencyContactScreen() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [currentLabel, setCurrentLabel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const contacts = await fetchEmergencyContacts(user.id);
    const primary = contacts[0];
    if (primary) {
      setCurrentLabel(`${primary.name} · ${primary.phone}`);
      setName(primary.name);
      setPhone(primary.phone);
      setRelationship(primary.relationship ?? 'Family');
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!user?.id || !name.trim() || !phone.trim()) return;
    setSaving(true);
    try {
      await saveEmergencyContact(user.id, {
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || 'Family',
      });
      setCurrentLabel(`${name.trim()} · ${phone.trim()}`);
      Alert.alert('Saved', 'Emergency contact updated.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await api.emergency.notify();
      Alert.alert(
        'Test sent',
        result.queued > 0
          ? `Notification queued for ${currentLabel ?? 'your contact'}.`
          : 'Test notification sent.',
      );
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send test');
    } finally {
      setTesting(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title="Emergency contact" showBack />
      {currentLabel ? (
        <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
          Current: {currentLabel}
        </AppText>
      ) : null}
      <AuthTextField label="Name" placeholder="Contact name" value={name} onChangeText={setName} />
      <AuthTextField
        label="Phone"
        placeholder="+251..."
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <AuthTextField
        label="Relationship"
        placeholder="Family"
        value={relationship}
        onChangeText={setRelationship}
      />
      <AppButton
        label="Save contact"
        onPress={handleSave}
        loading={saving}
        style={{ marginTop: Spacing.three }}
      />
      <AppButton
        label="Send test notification"
        variant="secondary"
        onPress={handleTest}
        loading={testing}
        disabled={!currentLabel && (!name.trim() || !phone.trim())}
      />
    </AppScreen>
  );
}
