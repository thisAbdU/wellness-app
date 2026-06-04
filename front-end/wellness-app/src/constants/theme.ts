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
    success: '#3D8B63',
    warning: '#BA7517',
    gold: '#D4A017',
    silver: '#9AA3AD',
    bronze: '#B87333',
    overlay: 'rgba(31, 41, 35, 0.45)',
    accentPurple: '#534AB7',
    accentOrange: '#C4622D',
    accentMint: '#7EDBA6',
    cardShadow: 'rgba(31, 41, 35, 0.06)',
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
    success: '#5FA17B',
    warning: '#D4A84A',
    gold: '#E8C547',
    silver: '#B8C0BA',
    bronze: '#C9956A',
    overlay: 'rgba(0, 0, 0, 0.55)',
    accentPurple: '#7B72D4',
    accentOrange: '#E07A5F',
    accentMint: '#5FA17B',
    cardShadow: 'rgba(0, 0, 0, 0.2)',
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