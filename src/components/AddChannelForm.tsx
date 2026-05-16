import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PinPad } from '@/components/PinPad';
import { colors, radius, spacing } from '@/constants/theme';
import {
  customChannelSlug,
  resolveYoutubeChannel,
} from '@/services/youtubeChannelResolver';
import { useAppStore } from '@/store/useAppStore';

type AddChannelFormProps = {
  onAdded: () => void;
  onCancel: () => void;
};

export function AddChannelForm({ onAdded, onCancel }: AddChannelFormProps) {
  const verifyPin = useAppStore((s) => s.verifyPin);
  const isKnownChannel = useAppStore((s) => s.isKnownChannel);
  const addCustomChannel = useAppStore((s) => s.addCustomChannel);

  const [step, setStep] = useState<'pin' | 'form'>('pin');
  const [pin, setPin] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const onPinComplete = (value: string) => {
    if (!verifyPin(value)) {
      Alert.alert('PIN incorreto');
      setPin('');
      return;
    }
    setPin('');
    setStep('form');
  };

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const resolved = await resolveYoutubeChannel(query);
      if (isKnownChannel(resolved.youtubeChannelId)) {
        Alert.alert('Canal já disponível', 'Esse canal já está na lista do app.');
        return;
      }
      addCustomChannel({
        slug: customChannelSlug(resolved.youtubeChannelId),
        title: resolved.title,
        youtubeChannelId: resolved.youtubeChannelId,
      });
      await AsyncStorage.removeItem('calmdowntube-channel-feed-cache').catch(() => undefined);
      Alert.alert('Canal adicionado', `${resolved.title} já aparece em Canais e no Início.`);
      onAdded();
    } catch (error) {
      Alert.alert(
        'Não foi possível adicionar',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 'pin') {
    return (
      <View style={styles.wrap}>
        <PinPad
          value={pin}
          onChange={(v) => {
            setPin(v);
            if (v.length === 4) {
              setTimeout(() => onPinComplete(v), 0);
            }
          }}
          title="PIN dos pais"
          subtitle="Necessário para adicionar um canal"
        />
        <Pressable onPress={onCancel} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Nome ou link do canal</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: Galinha Pintadinha ou @canal"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.hint}>
        Aceita nome do canal, @ do YouTube ou link youtube.com/channel/...
      </Text>
      <View style={styles.row}>
        <Pressable style={styles.secondaryBtn} onPress={onCancel}>
          <Text style={styles.secondaryBtnText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Adicionar</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: colors.text,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  cancel: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelText: {
    color: colors.textMuted,
  },
});
