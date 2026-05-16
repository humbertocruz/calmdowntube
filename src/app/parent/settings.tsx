import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ProfileCard } from '@/components/ProfileCard';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

const EMOJIS = ['🦊', '🐻', '🐼', '🦁', '🐸', '🦄', '🐨', '🐰'];
const COLORS = ['#6b8cce', '#6b9e7a', '#9e6b8c', '#ce9e6b', '#6bcec9', '#8c6bce'];

export default function ParentSettingsScreen() {
  const profiles = useAppStore((s) => s.profiles);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const addProfile = useAppStore((s) => s.addProfile);
  const removeProfile = useAppStore((s) => s.removeProfile);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🦊');
  const [avatarColor, setAvatarColor] = useState(COLORS[0]);
  const [maxVolume, setMaxVolume] = useState('60');

  const startEdit = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    setName(p.name);
    setEmoji(p.emoji);
    setAvatarColor(p.avatarColor);
    setMaxVolume(String(p.maxVolume));
  };

  const saveProfile = () => {
    const vol = Math.min(100, Math.max(10, Number(maxVolume) || 60));
    if (editingId) {
      updateProfile(editingId, {
        name: name.trim() || 'Explorer',
        emoji,
        avatarColor,
        maxVolume: vol,
      });
    } else {
      addProfile({
        name: name.trim() || 'New profile',
        emoji,
        avatarColor,
        maxVolume: vol,
      });
    }
    setEditingId(null);
    setName('');
  };

  return (
    <Screen
      title="Parent settings"
      subtitle="Profiles, volume limits, and PIN"
      headerRight={
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.done}>Done</Text>
        </Pressable>
      }
    >
      <Text style={styles.section}>Child profiles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {profiles.map((p) => (
          <ProfileCard key={p.id} profile={p} onPress={() => startEdit(p.id)} />
        ))}
      </ScrollView>

      <View style={styles.form}>
        <Text style={styles.section}>
          {editingId ? 'Edit profile' : 'Add profile'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Emoji</Text>
        <View style={styles.emojiRow}>
          {EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              style={[styles.emojiBtn, emoji === e && styles.emojiSelected]}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Avatar color</Text>
        <View style={styles.emojiRow}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setAvatarColor(c)}
              style={[
                styles.colorSwatch,
                { backgroundColor: c },
                avatarColor === c && styles.colorSelected,
              ]}
            />
          ))}
        </View>
        <Text style={styles.label}>Max volume (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={maxVolume}
          onChangeText={setMaxVolume}
          placeholderTextColor={colors.textMuted}
        />
        <Pressable style={styles.saveBtn} onPress={saveProfile}>
          <Text style={styles.saveBtnText}>
            {editingId ? 'Save changes' : 'Add profile'}
          </Text>
        </Pressable>
        {editingId && profiles.length > 1 ? (
          <Pressable
            style={styles.removeBtn}
            onPress={() => {
              Alert.alert('Remove profile?', undefined, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => {
                    removeProfile(editingId);
                    setEditingId(null);
                  },
                },
              ]);
            }}
          >
            <Text style={styles.removeBtnText}>Remove profile</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => {
            setEditingId(null);
            setName('');
            setEmoji('🦊');
            setMaxVolume('60');
          }}
        >
          <Text style={styles.secondaryBtnText}>New profile form</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.pinBtn}
        onPress={() => router.push('/parent/setup-pin')}
      >
        <Text style={styles.pinBtnText}>Change parent PIN</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  done: {
    color: colors.accent,
    fontWeight: '600',
  },
  section: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emojiBtn: {
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  emojiSelected: {
    backgroundColor: colors.accentSoft,
  },
  emojiText: {
    fontSize: 24,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.text,
    fontWeight: '700',
  },
  removeBtn: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  removeBtnText: {
    color: colors.danger,
  },
  secondaryBtn: {
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.textMuted,
  },
  pinBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  pinBtnText: {
    color: colors.text,
    fontWeight: '600',
  },
});
