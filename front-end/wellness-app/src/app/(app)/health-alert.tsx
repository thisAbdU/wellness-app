import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { navigate } from '@/lib/router';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function HealthAlertModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string;
    body?: string;
    type?: string;
  }>();

  const title = params.title ?? 'Health alert';
  const body =
    params.body ??
    'We detected an unusual pattern in your health data. Review your recent activity and rest as needed.';
  const icon = params.type === 'sleep' ? '😴' : params.type === 'heart' ? '❤️' : '⚠️';

  return (
    <Modal transparent animationType="slide" visible>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <AppText style={{ fontSize: 48, textAlign: 'center' }}>{icon}</AppText>
          <AppText variant="subtitle" align="center" style={{ marginTop: Spacing.three }}>
            {title}
          </AppText>
          <AppText variant="body" style={{ marginVertical: Spacing.four }}>
            {body}
          </AppText>
          <AppButton label="Dismiss" variant="ghost" onPress={() => router.back()} />
          <AppButton
            label="See recommendations"
            onPress={() => {
              router.back();
              navigate('/(app)/(tabs)/home/coach');
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.light.backgroundElement,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
});
