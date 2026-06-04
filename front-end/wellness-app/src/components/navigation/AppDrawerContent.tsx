import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MOCK_USER } from '@/constants/mockData';
import { signOut } from '@/lib/appState';
import { navigate as goTo, replace } from '@/lib/router';

const DRAWER_ITEMS = [
  { label: 'Profile', route: '/(app)/profile', icon: '👤' },
  { label: 'Settings', route: '/(app)/settings', icon: '⚙️' },
  { label: 'Language', route: '/(app)/language', icon: '🌐' },
  { label: 'Emergency Contact', route: '/(app)/emergency-contact', icon: '🆘' },
  { label: 'Help & FAQ', route: '/(app)/help', icon: '❓' },
  { label: 'About', route: '/(app)/about', icon: 'ℹ️' },
  { label: 'Voice Coach', route: '/(app)/voice-coach', icon: '🎙️' },
] as const;

type DrawerContentProps = {
  navigation: {
    closeDrawer: () => void;
  };
};

export function AppDrawerContent({ navigation }: DrawerContentProps) {
  const insets = useSafeAreaInsets();

  const openRoute = (route: string) => {
    navigation.closeDrawer();
    goTo(route);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + Spacing.four }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <AppText variant="subtitle" color={Colors.light.primary}>
            {MOCK_USER.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </AppText>
        </View>
        <AppText variant="bodyStrong">{MOCK_USER.name}</AppText>
        <AppText variant="caption">{MOCK_USER.city}</AppText>
      </View>

      <View style={styles.menu}>
        {DRAWER_ITEMS.map((item) => (
          <Pressable
            key={item.route}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => openRoute(item.route)}
          >
            <AppText style={styles.menuIcon}>{item.icon}</AppText>
            <AppText variant="bodyStrong">{item.label}</AppText>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.sosBtn, pressed && { opacity: 0.9 }]}
        onPress={() => openRoute('/(app)/sos')}
      >
        <AppText variant="bodyStrong" color="#fff">
          Emergency SOS
        </AppText>
      </Pressable>

      <Pressable
        style={styles.logout}
        onPress={() => {
          signOut();
          navigation.closeDrawer();
          replace('/(auth)/sign-in');
        }}
      >
        <AppText variant="bodyStrong" color={Colors.light.error}>
          Logout
        </AppText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    backgroundColor: Colors.light.backgroundElement,
  },
  header: {
    marginBottom: Spacing.four,
    gap: Spacing.one,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  menu: { flex: 1, gap: Spacing.one },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
  },
  menuItemPressed: {
    backgroundColor: Colors.light.backgroundSelected,
  },
  menuIcon: { fontSize: 20, width: 28 },
  sosBtn: {
    backgroundColor: Colors.light.error,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  logout: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
