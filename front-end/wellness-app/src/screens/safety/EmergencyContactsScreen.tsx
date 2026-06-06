import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { EmergencyContact } from '@/lib/api/types';
import {
  createEmergencyContact,
  deleteEmergencyContact,
  fetchEmergencyContacts,
  updateEmergencyContact,
} from '@/services/emergencyContactService';

type FormState = {
  name: string;
  phone_number: string;
  relationship: string;
  is_primary: boolean;
};

const EMPTY_FORM: FormState = {
  name: '',
  phone_number: '',
  relationship: 'Family',
  is_primary: false,
};

export function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContacts(await fetchEmergencyContacts());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load contacts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const editContact = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setForm({
      name: contact.name,
      phone_number: contact.phone_number,
      relationship: contact.relationship,
      is_primary: contact.is_primary,
    });
  };

  const saveContact = async () => {
    if (!form.name.trim() || !form.phone_number.trim()) {
      Alert.alert('Missing details', 'Name and phone number are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone_number: form.phone_number.trim(),
        relationship: form.relationship.trim() || 'Family',
        is_primary: form.is_primary,
      };
      if (editingId) await updateEmergencyContact(editingId, payload);
      else await createEmergencyContact(payload);
      resetForm();
      await load();
    } catch (saveError) {
      Alert.alert(
        'Could not save contact',
        saveError instanceof Error ? saveError.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (contact: EmergencyContact) => {
    Alert.alert('Delete emergency contact?', `${contact.name} will no longer receive SOS alerts.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEmergencyContact(contact.id);
            if (editingId === contact.id) resetForm();
            await load();
          } catch (deleteError) {
            Alert.alert(
              'Could not delete contact',
              deleteError instanceof Error ? deleteError.message : 'Please try again.',
            );
          }
        },
      },
    ]);
  };

  return (
    <AppScreen keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Emergency contacts" showBack />
      <AppText variant="caption" style={styles.intro}>
        SOS alerts are sent to these contacts. Keep at least one current phone number saved.
      </AppText>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      ) : error ? (
        <AppCard style={styles.errorCard}>
          <AppText variant="bodyStrong">Contacts unavailable</AppText>
          <AppText variant="caption">{error}</AppText>
          <AppButton label="Try again" variant="secondary" onPress={load} />
        </AppCard>
      ) : contacts.length === 0 ? (
        <AppText variant="caption">No emergency contacts saved yet.</AppText>
      ) : (
        <View style={styles.list}>
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={() => editContact(contact)}
              onDelete={() => confirmDelete(contact)}
            />
          ))}
        </View>
      )}

      <AppText variant="overline" style={styles.formTitle}>
        {editingId ? 'Edit contact' : 'Add contact'}
      </AppText>
      <AppCard style={styles.form}>
        <AuthTextField
          label="Name"
          value={form.name}
          onChangeText={(name) => setForm((current) => ({ ...current, name }))}
          placeholder="Contact name"
        />
        <AuthTextField
          label="Phone number"
          value={form.phone_number}
          onChangeText={(phone_number) => setForm((current) => ({ ...current, phone_number }))}
          placeholder="+251..."
          keyboardType="phone-pad"
        />
        <AuthTextField
          label="Relationship"
          value={form.relationship}
          onChangeText={(relationship) => setForm((current) => ({ ...current, relationship }))}
          placeholder="Family, friend, doctor"
        />
        <AppButton
          label={form.is_primary ? 'Primary contact' : 'Make primary contact'}
          variant="secondary"
          onPress={() => setForm((current) => ({ ...current, is_primary: !current.is_primary }))}
        />
        <AppButton
          label={editingId ? 'Save changes' : 'Add contact'}
          onPress={saveContact}
          loading={saving}
        />
        {editingId ? <AppButton label="Cancel editing" variant="ghost" onPress={resetForm} /> : null}
      </AppCard>
    </AppScreen>
  );
}

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: EmergencyContact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <AppCard style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactName}>
          <AppText variant="bodyStrong">{contact.name}</AppText>
          <AppText variant="caption">{contact.relationship}</AppText>
        </View>
        {contact.is_primary ? (
          <View style={styles.primaryBadge}>
            <AppText variant="overline" color={Colors.light.primary}>Primary</AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="body">{contact.phone_number}</AppText>
      <View style={styles.contactActions}>
        <View style={styles.action}><AppButton label="Edit" variant="secondary" onPress={onEdit} /></View>
        <View style={styles.action}><AppButton label="Delete" variant="ghost" onPress={onDelete} /></View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: Spacing.four },
  centered: { alignItems: 'center', padding: Spacing.four },
  errorCard: { gap: Spacing.two },
  list: { gap: Spacing.three },
  contactCard: { gap: Spacing.two },
  contactHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  contactName: { flex: 1 },
  primaryBadge: {
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  contactActions: { flexDirection: 'row', gap: Spacing.two },
  action: { flex: 1 },
  formTitle: { marginTop: Spacing.four, marginBottom: Spacing.two },
  form: { gap: Spacing.three },
});
