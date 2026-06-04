import React, { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, MaxContentWidth } from '@/constants/theme';

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  withHorizontalPadding?: boolean;
} & Omit<ScrollViewProps, 'contentContainerStyle' | 'children'>;

export function AppScreen({
  children,
  scrollable = true,
  style,
  contentStyle,
  withHorizontalPadding = true,
  ...scrollProps
}: Props) {
  const contentPadding = withHorizontalPadding ? Spacing.four : 0;

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, style]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: contentPadding,
            },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View
        style={[
          styles.inner,
          styles.fill,
          {
            paddingHorizontal: contentPadding,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: Spacing.four,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  fill: {
    flex: 1,
  },
});