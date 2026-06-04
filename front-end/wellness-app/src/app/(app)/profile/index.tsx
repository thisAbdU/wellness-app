import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { navigate, replace } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MOCK_USER } from '@/constants/mockData';

export default function ProfileScreen() {
  const router = useRouter();
  const initials = MOCK_USER.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <AppScreen>
      <ScreenHeader title="Profile" showBack />
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <AppText variant="subtitle" color={Colors.light.primary}>
            {initials}
          </AppText>
        </View>
        <AppText variant="title">{MOCK_USER.name}</AppText>
        <AppText variant="caption">
          {MOCK_USER.age} · {MOCK_USER.city} · {MOCK_USER.weightKg} kg
        </AppText>
        <AppText variant="caption">Goal: {MOCK_USER.goal}</AppText>
        <TouchableOpacity onPress={() => navigate('/(app)/profile/edit')}>
          <AppText variant="link">Edit profile</AppText>
        </TouchableOpacity>
      </View>
      <View style={styles.stats}>
        {[
          ['Workouts', '48'],
          ['Steps (month)', '214k'],
          ['Longest streak', '21d'],
        ].map(([k, v]) => (
          <AppCard key={k} style={styles.stat}>
            <AppText variant="caption">{k}</AppText>
            <AppText variant="bodyStrong">{v}</AppText>
          </AppCard>
        ))}
      </View>
      <TouchableOpacity onPress={() => navigate('/(app)/profile/metrics-history')}>
        <AppText variant="link">Body metrics history →</AppText>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: Spacing.two }}
        onPress={() => navigate('/(app)/profile/badges')}
      >
        <AppText variant="link">Badges & levels →</AppText>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: Spacing.four }}
        onPress={() => navigate('/(app)/sos')}
      >
        <AppText variant="link" color={Colors.light.error}>
          Emergency SOS →
        </AppText>
      </TouchableOpacity>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.four },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  stats: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.four },
  stat: { flex: 1, alignItems: 'center', gap: Spacing.one },
});
