import { Drawer } from 'expo-router/drawer';
import { View, StyleSheet } from 'react-native';
import { AppDrawerContent } from '@/components/navigation/AppDrawerContent';
import { OfflineBanner } from '@/components/navigation/OfflineBanner';
import { HealthSyncBoot } from '@/components/HealthSyncBoot';
import { Colors } from '@/constants/theme';

export default function AppDrawerLayout() {
  return (
    <View style={styles.wrap}>
      <HealthSyncBoot />
      <OfflineBanner />
      <Drawer
        drawerContent={(props) => <AppDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: { width: 300, backgroundColor: Colors.light.backgroundElement },
          drawerType: 'front',
          swipeEdgeWidth: 60,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{ drawerItemStyle: { display: 'none' }, title: 'Main' }}
        />
        <Drawer.Screen name="profile" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="settings" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="voice-coach" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="language" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen
          name="emergency-contact"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen name="help" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="about" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="privacy" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="terms" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="sos" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="health-alert" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="fall-detection" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen
          name="health-connect-unavailable"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
      </Drawer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
});
