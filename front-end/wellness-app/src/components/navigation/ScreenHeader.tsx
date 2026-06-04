import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  right?: React.ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  showMenu = false,
  right,
}: Props) {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showMenu && (
          <Pressable
            style={styles.iconBtn}
            onPress={() => {
              const nav = navigation as { openDrawer?: () => void };
              nav.openDrawer?.();
            }}
          >
            <AppText style={styles.icon}>☰</AppText>
          </Pressable>
        )}
        {showBack && (
          <Pressable style={styles.iconBtn} onPress={() => router.back()}>
            <AppText style={styles.icon}>←</AppText>
          </Pressable>
        )}
        <View>
          {title ? <AppText variant="subtitle">{title}</AppText> : null}
          {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.light.border,
  },
  icon: { fontSize: 18 },
});
