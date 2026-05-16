import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import type { ChildProfile } from '@/types';

type ProfileCardProps = {
  profile: ChildProfile;
  onPress: () => void;
  selected?: boolean;
};

export function ProfileCard({ profile, onPress, selected }: ProfileCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: selected ? profile.avatarColor : colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
        <Text style={styles.emoji}>{profile.emoji}</Text>
      </View>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.meta}>Max volume {profile.maxVolume}%</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 140,
  },
  pressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
