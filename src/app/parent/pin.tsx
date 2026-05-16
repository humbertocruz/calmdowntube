import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { useStoreHydration } from '@/hooks/useStoreHydration';
import { useAppStore } from '@/store/useAppStore';

export default function ParentPinScreen() {
  const hydrated = useStoreHydration();
  const parentPin = useAppStore((s) => s.parentPin);
  const verifyPin = useAppStore((s) => s.verifyPin);
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (hydrated && !parentPin) {
      router.replace('/parent/setup-pin');
    }
  }, [hydrated, parentPin]);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!parentPin) return null;

  return (
    <Screen scroll={false}>
      <PinPad
        value={pin}
        onChange={(v) => {
          setPin(v);
          if (v.length === 4) {
            if (verifyPin(v)) {
              router.replace('/parent/settings');
            } else {
              Alert.alert('Wrong PIN');
              setPin('');
            }
          }
        }}
        title="Parent access"
        subtitle="Enter your PIN to open settings"
      />
      <Pressable onPress={() => router.back()} style={styles.cancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textMuted,
  },
});
