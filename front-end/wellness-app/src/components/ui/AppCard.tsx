import React, { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
  subtle?: boolean;
};

export function AppCard({
  children,
  style,
  onPress,
  padded = true,
  subtle = false,
}: Props) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress as never}
      style={[
        styles.card,
        subtle && styles.subtle,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  subtle: {
    backgroundColor: Colors.light.background,
  },
  padded: {
    padding: Spacing.four,
  },
});
