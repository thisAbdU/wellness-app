import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { navigate } from '@/lib/router';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

export default function ProfileScreen() {
  const { profile, isLoading } = useAuth();
  const { wellnessStreak, activityStreak } = useDashboard();

  const initials = (profile?.full_name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <AppScreen>
        <ScreenHeader title="Profile" showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Profile" showBack />
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <AppText variant="subtitle" color={Colors.light.primary}>
            {initials}
          </AppText>
        </View>
        <AppText variant="title">{profile?.full_name ?? 'Your profile'}</AppText>
        <AppText variant="caption">
          {[profile?.age, profile?.city, profile?.weight_kg ? `${profile.weight_kg} kg` : null]
            .filter(Boolean)
            .join(' · ') || 'Complete your profile'}
        </AppText>
        {profile?.fitness_goal ? (
          <AppText variant="caption">Goal: {profile.fitness_goal}</AppText>
        ) : null}
        <TouchableOpacity onPress={() => navigate('/(app)/profile/edit')}>
          <AppText variant="link">Edit profile</AppText>
        </TouchableOpacity>
      </View>
      <View style={styles.stats}>
        {[
          ['Height', profile?.height_cm ? `${profile.height_cm} cm` : ''],
          ['Weight', profile?.weight_kg ? `${profile.weight_kg} kg` : ''],
          ['Longest streak', `${Math.max(wellnessStreak, activityStreak)}d`],
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
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
