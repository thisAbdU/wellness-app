import { DefaultTheme, ThemeProvider } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

const KomootTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E6B4D',
    background: '#F6F7F3',
    card: '#FFFFFF',
    text: '#1F2A24',
    border: '#E3E8E3',
    notification: '#2E6B4D',
  },
};

export default function TabLayout() {
  return (
    <ThemeProvider value={KomootTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}