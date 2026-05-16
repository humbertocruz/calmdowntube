import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { VideoCard } from '@/components/VideoCard';
import { approvedChannels } from '@/constants/approvedChannels';
import { CHANNEL_PLAYLIST_ID } from '@/constants/searchFilters';
import { colors, spacing } from '@/constants/theme';
import { fetchChannelVideos } from '@/services/youtubeChannelFeed';
import { useAppStore } from '@/store/useAppStore';
import type { VideoItem } from '@/types';

export default function ChannelScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const profile = useAppStore((s) => s.getActiveProfile());
  const customChannels = useAppStore((s) => s.customChannels);
  const setChannelPlaylist = useAppStore((s) => s.setChannelPlaylist);
  const isChannelBlocked = useAppStore((s) => s.isChannelBlocked);
  const isChannelHidden = useAppStore((s) => s.isChannelHidden);
  const isVideoBlocked = useAppStore((s) => s.isVideoBlocked);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channel =
    approvedChannels.find((c) => c.slug === slug) ??
    customChannels.find((c) => c.slug === slug);

  const load = useCallback(async () => {
    if (!channel || !profile) return;
    setLoading(true);
    setError(null);
    try {
      const items = await fetchChannelVideos(
        channel.youtubeChannelId,
        channel.slug,
        channel.title,
        20,
      );
      const filtered = items.filter(
        (v) =>
          !isVideoBlocked(profile.id, v.id) &&
          !isChannelBlocked(profile.id, v.channelId),
      );
      setVideos(filtered);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  }, [channel, profile, isChannelBlocked, isVideoBlocked]);

  useEffect(() => {
    if (!profile) {
      router.replace('/');
      return;
    }
    if (slug && isChannelHidden(profile.id, slug)) {
      router.back();
      return;
    }
    load();
  }, [load, profile, slug, isChannelHidden]);

  if (!profile || !channel) return null;
  if (isChannelHidden(profile.id, channel.slug)) return null;

  const openVideo = (videoId: string, index: number) => {
    setChannelPlaylist(videos);
    router.push({
      pathname: '/player',
      params: {
        videoId,
        playlistId: CHANNEL_PLAYLIST_ID,
        index: String(index),
      },
    });
  };

  return (
    <Screen
      title={channel.title}
      subtitle="Vídeos recentes do canal"
      onBack={() => router.back()}
      headerRight={
        <Pressable onPress={load}>
          <Text style={styles.refresh}>Atualizar</Text>
        </Pressable>
      }
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={styles.list}>
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              compact
              onPress={() => openVideo(video.id, index)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  refresh: {
    color: colors.accent,
    fontWeight: '600',
  },
  error: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  list: {
    gap: spacing.md,
  },
});
