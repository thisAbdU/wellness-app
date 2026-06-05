import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { ETHIOPIA_CITIES, ETHIOPIA_REGIONS } from '@/constants/ethiopia';
import { Spacing } from '@/constants/theme';
import { AppText } from '@/components/ui/AppText';
import { useAuth } from '@/contexts/AuthContext';

export default function LocationSetup() {
  const router = useRouter();
  const { profile, updateProfile } = useAuth();
  const [region, setRegion] = useState(profile?.region ?? ETHIOPIA_REGIONS[0]);
  const [city, setCity] = useState(profile?.city ?? ETHIOPIA_CITIES[0]);
  const [neighborhood, setNeighborhood] = useState(profile?.neighborhood ?? '');
  const [org, setOrg] = useState(profile?.university ?? profile?.company ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.region) setRegion(profile.region);
    if (profile.city) setCity(profile.city);
    if (profile.neighborhood) setNeighborhood(profile.neighborhood);
    if (profile.university || profile.company) {
      setOrg(profile.university ?? profile.company ?? '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        region: region.trim() || undefined,
        city: city.trim() || undefined,
        neighborhood: neighborhood.trim() || undefined,
        university: org.trim() || undefined,
      });
      router.back();
    } catch {
      setSaving(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title="Location" showBack />
      <AppText variant="caption" style={{ marginBottom: Spacing.four }}>
        Fine-grained location powers city, neighborhood, and university rankings.
      </AppText>
      <AuthTextField label="Regional state" value={region} onChangeText={setRegion} />
      <AuthTextField label="City" value={city} onChangeText={setCity} />
      <AuthTextField
        label="Neighborhood"
        placeholder="Search..."
        value={neighborhood}
        onChangeText={setNeighborhood}
      />
      <AuthTextField
        label="University / Company (optional)"
        placeholder="Search..."
        value={org}
        onChangeText={setOrg}
      />
      <AppButton
        label="Save location"
        onPress={handleSave}
        disabled={saving}
        style={{ marginTop: Spacing.four }}
      />
    </AppScreen>
  );
}
