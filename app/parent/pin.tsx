import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function ParentPinScreen() {
  const hasPin = useAppStore((s) => s.hasPin);
  const verifyPin = useAppStore((s) => s.verifyPin);
  const [pin, setPin] = useState('');

  if (!hasPin()) {
    router.replace('/parent/setup-pin');
    return null;
  }

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
  cancel: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textMuted,
  },
});
