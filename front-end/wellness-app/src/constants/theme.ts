import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F6F7F3',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8F0EA',
    text: '#1F2A24',
    textSecondary: '#6B746E',
    primary: '#2E6B4D',
    primaryLight: '#DDEAE3',
    border: '#E3E8E3',
    tint: '#3D7A5A',
    tabIconDefault: '#A89880',
  },
  dark: {
    background: '#111613',
    backgroundElement: '#1A221D',
    backgroundSelected: '#243329',
    text: '#F6F7F4',
    textSecondary: '#A8B2AC',
    primary: '#5FA17B',
    primaryLight: '#284336',
    border: '#2A342D',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;