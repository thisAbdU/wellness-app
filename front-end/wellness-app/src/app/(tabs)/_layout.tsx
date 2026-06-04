import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="checkin" />
      <Tabs.Screen name="insight" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}