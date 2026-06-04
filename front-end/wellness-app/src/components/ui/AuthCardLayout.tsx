import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { WellnessBackground } from '@/components/ui/WellnessBackground';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

/** Centered card on a calm wellness backdrop for sign-in and sign-up. */
export function AuthCardLayout({ children, footer }: Props) {
  return (
    <WellnessBackground variant="auth">
      <AppScreen
        scrollable
        style={styles.screen}
        contentStyle={styles.scroll}
        withHorizontalPadding={false}
      >
        <View style={styles.center}>
          <View style={styles.card}>{children}</View>
          {footer}
        </View>
      </AppScreen>
    </WellnessBackground>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: 'transparent' },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  center: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  card: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 78, 0.12)',
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 4,
    gap: Spacing.three,
  },
});
