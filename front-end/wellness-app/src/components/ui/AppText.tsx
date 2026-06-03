import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

type Variant =
  | 'body'
  | 'bodyStrong'
  | 'title'
  | 'subtitle'
  | 'caption'
  | 'overline'
  | 'link';

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
};

export function AppText({
  variant = 'body',
  color,
  align,
  style,
  ...props
}: Props) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        color ? { color } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: Colors.light.text,
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.sans,
    fontWeight: '500',
  },

  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.sans,
    fontWeight: '700',
  },

  title: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    letterSpacing: -0.4,
  },

  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },

  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.light.textSecondary,
  },

  link: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});