import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { VideoCard } from '@/components/VideoCard';
import { getPlaylist } from '@/constants/content';
import { colors, spacing } from '@/constants/theme';
import { useFilteredContent } from '@/hooks/useFilteredContent';
import { useAppStore } from '@/store/useAppStore';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAppStore((s) => s.getActiveProfile());
  const { getPlaylistVideos } = useFilteredContent();

  const playlist = id ? getPlaylist(id) : undefined;
  const items = id ? getPlaylistVideos(id) : [];

  useEffect(() => {
    if (!profile) router.replace('/');
  }, [profile]);

  if (!profile || !playlist) return null;

  return (
    <Screen
      title={playlist.title}
      subtitle={playlist.description}
      headerRight={
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Voltar</Text>
        </Pressable>
      }
    >
      <View style={styles.list}>
        {items.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            compact
            onPress={() =>
              router.push({
                pathname: '/player',
                params: {
                  videoId: video.id,
                  playlistId: playlist.id,
                  index: String(index),
                },
              })
            }
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    color: colors.accent,
    fontWeight: '600',
  },
  list: {
    gap: spacing.md,
  },
});
