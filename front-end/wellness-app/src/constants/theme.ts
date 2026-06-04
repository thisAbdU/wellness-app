import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F5F6F1',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E6EFE7',
    text: '#1F2923',
    textSecondary: '#69736D',
    primary: '#2F6B4E',
    primaryLight: '#DCE9E2',
    border: '#E1E6E0',
    tint: '#2F6B4E',
    tabIconDefault: '#9AA39D',
    tabIconSelected: '#2F6B4E',
    error: '#C45A5A',
  },
  dark: {
    background: '#111613',
    backgroundElement: '#1A221D',
    backgroundSelected: '#243329',
    text: '#F4F7F4',
    textSecondary: '#A7B1AB',
    primary: '#5FA17B',
    primaryLight: '#284336',
    border: '#2A342D',
    tint: '#5FA17B',
    tabIconDefault: '#7F8A84',
    tabIconSelected: '#5FA17B',
    error: '#D26B6B',
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