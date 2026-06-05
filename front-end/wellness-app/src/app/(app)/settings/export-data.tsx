import React, { useState } from 'react';
import { Alert, Share } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAiInsights } from '@/services/profileService';

export default function ExportDataScreen() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const insights = await fetchAiInsights(user.id);
      const payload = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email,
        profile,
        insights,
      };
      const json = JSON.stringify(payload, null, 2);
      await Share.share({ message: json, title: 'Wellness data export' });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title="Export my data" showBack />
      <AppText variant="body" style={{ marginBottom: Spacing.four }}>
        Download a copy of your profile and saved AI insights. Health metrics synced from your
        device are included when available.
      </AppText>
      <AppButton label="Export as JSON" onPress={handleExport} loading={loading} />
    </AppScreen>
  );
}
