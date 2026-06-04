import { ColorValue, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';

const TAB_CONFIG = [
  { name: 'home', title: 'Home', icon: '🏠' },
  { name: 'activity', title: 'Activity', icon: '🏃' },
  { name: 'nutrition', title: 'Nutrition', icon: '🥗' },
  { name: 'challenges', title: 'Challenges', icon: '🏆' },
  { name: 'leaderboard', title: 'Leaderboard', icon: '📊' },
] as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.light.backgroundElement,
          borderTopColor: Colors.light.border,
          height: 64,
          paddingBottom: Spacing.two,
          paddingTop: Spacing.two,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => (
              <TabIcon emoji={tab.icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: ColorValue }) {
  const selected = String(color) === Colors.light.tabIconSelected;
  return (
    <Text style={{ fontSize: 22, opacity: selected ? 1 : 0.55 }}>
      {emoji}
    </Text>
  );
}
