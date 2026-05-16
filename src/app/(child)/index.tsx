import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import { VideoCard } from '@/components/VideoCard';
import { FEED_PLAYLIST_ID } from '@/constants/content';
import { colors, spacing } from '@/constants/theme';
import { useVisibleChannels } from '@/hooks/useApprovedChannels';
import { useFilteredContent } from '@/hooks/useFilteredContent';
import { useAppStore } from '@/store/useAppStore';
import { useFeedStore } from '@/store/useFeedStore';

export default function ChildHomeScreen() {
  const profile = useAppStore((s) => s.getActiveProfile());
  const visibleChannels = useVisibleChannels();
  const { getPlaylistVideos } = useFilteredContent();
  const feedVideos = getPlaylistVideos(FEED_PLAYLIST_ID);
  const feedLoading = useFeedStore((s) => s.feedLoading);
  const feedError = useFeedStore((s) => s.feedError);
  const loadDiscoverFeed = useFeedStore((s) => s.loadDiscoverFeed);

  useEffect(() => {
    loadDiscoverFeed(false, visibleChannels);
  }, [loadDiscoverFeed, visibleChannels]);

  const onRefresh = useCallback(() => {
    loadDiscoverFeed(true, visibleChannels);
  }, [loadDiscoverFeed, visibleChannels]);

  if (!profile) return null;

  const openVideo = (videoId: string, index: number) => {
    router.push({
      pathname: '/player',
      params: {
        videoId,
        playlistId: FEED_PLAYLIST_ID,
        index: String(index),
      },
    });
  };

  return (
    <Screen
      title={`Oi, ${profile.name}`}
      subtitle="Novidades dos canais oficiais + favoritos. Viu algo estranho? Pais podem bloquear."
      headerRight={
        <Pressable onPress={() => router.replace('/')} hitSlop={8}>
          <Text style={styles.switchBtn}>Trocar</Text>
        </Pressable>
      }
      scroll={false}
      contentStyle={styles.screenBody}
    >
      {feedLoading && feedVideos.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Carregando novidades…</Text>
        </View>
      ) : (
        <FlatList
          style={styles.listFlex}
          data={feedVideos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={feedLoading}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
          ListHeaderComponent={
            feedError ? (
              <Text style={styles.feedError}>
                {feedError}. Puxe para baixo para tentar de novo. Os vídeos salvos no app
                continuam aqui.
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nenhum vídeo disponível. Troque de perfil ou peça aos pais para revisar
              bloqueios.
            </Text>
          }
          renderItem={({ item, index }) => (
            <View style={styles.cardWrap}>
              <VideoCard video={item} onPress={() => openVideo(item.id, index)} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  listFlex: {
    flex: 1,
  },
  switchBtn: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
  },
  feedError: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    gap: spacing.md,
  },
  cardWrap: {
    flex: 1,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    padding: spacing.xl,
    lineHeight: 22,
  },
});
