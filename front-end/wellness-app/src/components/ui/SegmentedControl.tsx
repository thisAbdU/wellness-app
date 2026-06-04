import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export function SegmentedControl({ options, selected, onSelect }: Props) {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = opt === selected;
        return (
          <Pressable
            key={opt}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onSelect(opt)}
          >
            <AppText
              variant="caption"
              color={active ? Colors.light.primary : Colors.light.textSecondary}
              style={active ? styles.activeLabel : undefined}
            >
              {opt}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: Radius.pill,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  segmentActive: {
    backgroundColor: Colors.light.backgroundElement,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeLabel: { fontWeight: '700' },
});
