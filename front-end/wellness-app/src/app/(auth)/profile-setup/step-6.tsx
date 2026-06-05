import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { replace } from '@/lib/router';
import { AuthCardLayout } from '@/components/ui/AuthCardLayout';
import { AppButton } from '@/components/ui/AppButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { DEFAULT_COUNTRY_CODE } from '@/constants/ethiopia';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileSetup } from '@/contexts/ProfileSetupContext';
import { saveEmergencyContact } from '@/services/profileService';
import { useLocalization } from '@/hooks/useLocalization';

export default function ProfileStep6() {
  const { user, saveProfileSetup } = useAuth();
  const { data } = useProfileSetup();
  const { setAppLocale } = useLocalization();
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);

  const finish = async (withContact: boolean) => {
    setLoading(true);
    try {
      await saveProfileSetup(data);
      await setAppLocale(data.preferredLanguage);
      if (withContact && contactName && contactPhone && user?.id) {
        await saveEmergencyContact(user.id, {
          name: contactName,
          phone: contactPhone.startsWith('+') ? contactPhone : `${DEFAULT_COUNTRY_CODE}${contactPhone}`,
          relationship: relationship || 'Family',
        });
      }
      replace('/(app)/(tabs)/home');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save profile';
      console.error('[profile-setup step-6]', e);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Error: ${message}`);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout>
      <AuthHeader title="Emergency contact" subtitle="Step 6 of 6 — Optional" />
      <AuthTextField label="Contact name" placeholder="Name" value={contactName} onChangeText={setContactName} />
      <AuthTextField
        label="Phone"
        placeholder={`${DEFAULT_COUNTRY_CODE} 9XX XXX XXXX`}
        keyboardType="phone-pad"
        value={contactPhone}
        onChangeText={setContactPhone}
      />
      <AuthTextField
        label="Relationship"
        placeholder="Family / Friend / Doctor"
        value={relationship}
        onChangeText={setRelationship}
      />
      <AppButton label="Save & finish" onPress={() => finish(true)} loading={loading} />
      <AppButton label="Skip for now" variant="ghost" onPress={() => finish(false)} />
    </AuthCardLayout>
  );
}
