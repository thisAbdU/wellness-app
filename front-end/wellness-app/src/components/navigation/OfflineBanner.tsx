import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { AppText } from '@/components/ui/AppText';
import { Colors, Spacing } from '@/constants/theme';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsub();
  }, []);

  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <AppText variant="caption" color="#fff" align="center">
        Offline  data will sync when connection returns.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.light.textSecondary,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
