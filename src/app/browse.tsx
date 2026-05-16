import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useFilteredContent } from '@/hooks/useFilteredContent';
import { useAppStore } from '@/store/useAppStore';

export default function BrowseScreen() {
  const profile = useAppStore((s) => s.getActiveProfile());
  const { playlists } = useFilteredContent();

  useEffect(() => {
    if (!profile) router.replace('/');
  }, [profile]);

  if (!profile) return null;

  return (
    <Screen
      title={`Hi, ${profile.name}`}
      subtitle="Pick something calm to watch"
      headerRight={
        <Pressable onPress={() => router.replace('/')} style={styles.switchBtn}>
          <Text style={styles.switchBtnText}>Switch</Text>
        </Pressable>
      }
    >
      <View style={styles.grid}>
        {playlists.map((playlist) => (
          <Pressable
            key={playlist.id}
            onPress={() =>
              router.push({
                pathname: '/playlist/[id]',
                params: { id: playlist.id },
              })
            }
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Text style={styles.cardEmoji}>{playlist.emoji}</Text>
            <Text style={styles.cardTitle}>{playlist.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {playlist.description}
            </Text>
            <Text style={styles.cardCount}>{playlist.videoIds.length} videos</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchBtn: {
    padding: spacing.sm,
  },
  switchBtnText: {
    color: colors.accent,
    fontWeight: '600',
  },
  grid: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  cardCount: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
