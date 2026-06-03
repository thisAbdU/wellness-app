import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.primaryLight}
      labelStyle={{
        selected: {
          color: colors.primary,
        },
      }}
    >
      ...
    </NativeTabs>
  );
}