import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Action = { icon: string; title: string; subtitle: string; bg: string; onPress?: () => void };

type Props = { actions: Action[] };

export function QuickActionGrid({ actions }: Props) {
  return (
    <View style={styles.row}>
      {actions.map((a) => (
        <TouchableOpacity key={a.title} style={styles.btn} onPress={a.onPress}>
          <View style={[styles.icon, { backgroundColor: a.bg }]}>
            <AppText style={{ fontSize: 18 }}>{a.icon}</AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong">{a.title}</AppText>
            <AppText variant="caption">{a.subtitle}</AppText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.four },
  btn: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: Colors.light.border,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
