import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function SetupPinScreen() {
  const setParentPin = useAppStore((s) => s.setParentPin);
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [first, setFirst] = useState('');
  const [confirm, setConfirm] = useState('');

  const onCreateComplete = (pin: string) => {
    setFirst(pin);
    setStep('confirm');
    setConfirm('');
  };

  const onConfirmComplete = (pin: string) => {
    if (pin !== first) {
      Alert.alert('PINs do not match', 'Please try again.');
      setStep('create');
      setFirst('');
      setConfirm('');
      return;
    }
    setParentPin(pin);
    router.replace('/');
  };

  return (
    <Screen scroll={false}>
      <PinPad
        value={step === 'create' ? first : confirm}
        onChange={(v) => {
          if (step === 'create') {
            setFirst(v);
            if (v.length === 4) onCreateComplete(v);
          } else {
            setConfirm(v);
            if (v.length === 4) onConfirmComplete(v);
          }
        }}
        title={step === 'create' ? 'Create parent PIN' : 'Confirm PIN'}
        subtitle="You'll need this for settings and blocking content."
      />
      {step === 'confirm' ? (
        <Pressable
          onPress={() => {
            setStep('create');
            setFirst('');
            setConfirm('');
          }}
          style={styles.back}
        >
          <Text style={styles.backText}>Start over</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  backText: {
    color: colors.textMuted,
  },
});
