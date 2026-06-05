import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useContentLayout } from '@/hooks/useContentLayout';

type Action = { icon: string; title: string; subtitle: string; bg: string; onPress?: () => void };

type Props = { actions: Action[] };

export function QuickActionGrid({ actions }: Props) {
  const { isMedium } = useContentLayout();

  return (
    <View style={[styles.row, isMedium ? styles.rowWide : styles.rowNarrow]}>
      {actions.map((a) => (
        <TouchableOpacity
          key={a.title}
          style={[styles.btn, isMedium ? styles.btnWide : styles.btnNarrow]}
          onPress={a.onPress}
        >
          <View style={[styles.icon, { backgroundColor: a.bg }]}>
            <AppText style={{ fontSize: 16 }}>{a.icon}</AppText>
          </View>
          <View style={styles.textWrap}>
            <AppText variant="bodyStrong">{a.title}</AppText>
            <AppText variant="caption">{a.subtitle}</AppText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.three,
    width: '100%',
  },
  rowWide: { justifyContent: 'space-between' },
  rowNarrow: { flexDirection: 'column' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
  },
  btnWide: {
    flex: 1,
    minWidth: 160,
  },
  btnNarrow: {
    width: '100%',
  },
  textWrap: { flex: 1 },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
