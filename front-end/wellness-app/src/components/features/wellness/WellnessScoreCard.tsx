import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  score: number;
  change?: string;
  message: string;
  onPress?: () => void;
};

export function WellnessScoreCard({ score, change, message, onPress }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score / 100,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [anim, score]);

  const barWidth = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const { width } = useWindowDimensions();
  const small = width < 360;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <AppText variant="overline" style={styles.label}>
        Wellness score
      </AppText>
      <View style={styles.row}>
    <AppText style={[styles.number, small ? styles.numberSmall : null]}>{score}</AppText>
        {change ? <AppText style={styles.change}>{change}</AppText> : null}
      </View>
      <AppText style={styles.message}>{message}</AppText>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: barWidth }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: Radius.xl,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    // subtle shadow
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  label: { color: 'rgba(255,255,255,0.65)', marginBottom: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  number: { fontSize: 52, fontWeight: '500', color: '#fff', lineHeight: 56 },
  change: { fontSize: 12, color: 'rgba(255,255,255,0.7)', paddingBottom: 8 },
  message: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginVertical: Spacing.two },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  fill: { height: 4, borderRadius: 2, backgroundColor: Colors.light.accentMint },
  numberSmall: { fontSize: 40, lineHeight: 44 },
});
