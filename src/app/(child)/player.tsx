import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalmPlayer } from '@/components/CalmPlayer';
import { PlayerFullscreen } from '@/components/PlayerFullscreen';
import { PinPad } from '@/components/PinPad';
import { VideoCard } from '@/components/VideoCard';
import { getVideo, resolveYoutubeId } from '@/constants/content';
import { colors, radius, spacing } from '@/constants/theme';
import { useFilteredContent } from '@/hooks/useFilteredContent';
import { useAppStore } from '@/store/useAppStore';
import type { VideoItem } from '@/types';
import { lockPortrait, unlockOrientation } from '@/utils/screenOrientation';
import {
  findVideoByYoutubeId,
  suggestedVideoItem,
} from '@/utils/youtubeUrl';

const SWIPE_THRESHOLD = 56;

export default function PlayerScreen() {
  const { videoId, playlistId, index } = useLocalSearchParams<{
    videoId: string;
    playlistId?: string;
    index?: string;
  }>();

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const profile = useAppStore((s) => s.getActiveProfile());
  const blockVideo = useAppStore((s) => s.blockVideo);
  const verifyPin = useAppStore((s) => s.verifyPin);
  const isVideoBlocked = useAppStore((s) => s.isVideoBlocked);

  const { getPlaylistVideos } = useFilteredContent();
  const playlistVideos = useMemo(
    () => (playlistId ? getPlaylistVideos(playlistId) : []),
    [playlistId, getPlaylistVideos],
  );

  const [extraVideos, setExtraVideos] = useState<VideoItem[]>([]);

  const queue = useMemo(
    () => [...playlistVideos, ...extraVideos],
    [playlistVideos, extraVideos],
  );

  const initialIndex = useMemo(() => {
    if (!videoId || queue.length === 0) return 0;
    const fromParam = index ? Number(index) : -1;
    if (fromParam >= 0 && fromParam < queue.length) return fromParam;
    const found = queue.findIndex((v) => v.id === videoId);
    return found >= 0 ? found : 0;
  }, [videoId, index, queue]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(true);
  const [portraitFullscreen, setPortraitFullscreen] = useState(false);
  const [landscapeDismissed, setLandscapeDismissed] = useState(false);
  const [parentStep, setParentStep] = useState<'closed' | 'pin'>('closed');
  const [pin, setPin] = useState('');
  const navigating = useRef(false);

  const isDeviceLandscape = windowWidth > windowHeight;

  const fullscreen =
    parentStep === 'closed' &&
    (isDeviceLandscape ? !landscapeDismissed : portraitFullscreen);

  const video = queue[currentIndex] ?? (videoId ? getVideo(videoId) : undefined);
  const youtubeId = video ? resolveYoutubeId(video) : undefined;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < queue.length - 1;
  const showPlaylist = queue.length > 1;

  useEffect(() => {
    setExtraVideos([]);
  }, [playlistId, videoId]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useFocusEffect(
    useCallback(() => {
      setLandscapeDismissed(false);
      setPortraitFullscreen(false);
      unlockOrientation();
      return () => {
        setPortraitFullscreen(false);
        setLandscapeDismissed(false);
        lockPortrait();
      };
    }, []),
  );

  useEffect(() => {
    if (isDeviceLandscape) {
      setLandscapeDismissed(false);
    }
  }, [isDeviceLandscape]);

  const closeFullscreen = useCallback(() => {
    if (isDeviceLandscape) {
      setLandscapeDismissed(true);
    } else {
      setPortraitFullscreen(false);
    }
  }, [isDeviceLandscape]);

  const goBack = useCallback(() => {
    setPortraitFullscreen(false);
    setLandscapeDismissed(false);
    lockPortrait().finally(() => router.back());
  }, []);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (navigating.current) return;
      if (nextIndex < 0 || nextIndex >= queue.length) return;
      navigating.current = true;
      setCurrentIndex(nextIndex);
      setPlaying(true);
      setTimeout(() => {
        navigating.current = false;
      }, 400);
    },
    [queue.length],
  );

  const handleSuggestedVideoId = useCallback(
    (ytId: string) => {
      if (!profile || !video) return;

      const existing = findVideoByYoutubeId(queue, ytId);
      if (existing && isVideoBlocked(profile.id, existing.id)) {
        return;
      }
      if (!existing && isVideoBlocked(profile.id, `yt-${ytId}`)) {
        return;
      }

      const indexInQueue = queue.findIndex((v) => resolveYoutubeId(v) === ytId);
      if (indexInQueue >= 0) {
        goToIndex(indexInQueue);
        return;
      }

      const item = suggestedVideoItem(ytId, video);
      setExtraVideos((prev) => {
        const nextIndex = playlistVideos.length + prev.length;
        setTimeout(() => {
          setCurrentIndex(nextIndex);
          setPlaying(true);
        }, 0);
        return [...prev, item];
      });
    },
    [profile, video, queue, playlistVideos.length, isVideoBlocked, goToIndex],
  );

  const goNext = useCallback(() => goToIndex(currentIndex + 1), [currentIndex, goToIndex]);
  const goPrev = useCallback(() => goToIndex(currentIndex - 1), [currentIndex, goToIndex]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-24, 24])
        .onEnd((event) => {
          if (event.translationY <= -SWIPE_THRESHOLD && hasNext) {
            runOnJS(goNext)();
          } else if (event.translationY >= SWIPE_THRESHOLD && hasPrev) {
            runOnJS(goPrev)();
          }
        }),
    [goNext, goPrev, hasNext, hasPrev],
  );

  const openParentGate = () => {
    setPin('');
    setParentStep('pin');
  };

  const onParentPinComplete = (value: string) => {
    if (!verifyPin(value)) {
      Alert.alert('PIN incorreto');
      setPin('');
      return;
    }
    if (!profile || !video) return;
    blockVideo(profile.id, video.id);
    setPin('');
    setParentStep('closed');
    Alert.alert('Bloqueado', 'Este vídeo não aparecerá mais para este perfil.', [
      { text: 'OK', onPress: goBack },
    ]);
  };

  if (!profile) {
    router.replace('/');
    return null;
  }

  if (parentStep === 'pin') {
    return (
      <View style={[styles.pinRoot, { paddingTop: insets.top, paddingBottom: tabBarHeight }]}>
        <PinPad
          value={pin}
          onChange={(v) => {
            setPin(v);
            if (v.length === 4) {
              setTimeout(() => onParentPinComplete(v), 0);
            }
          }}
          title="Área dos pais"
          subtitle="Digite o PIN para bloquear este vídeo"
        />
        <Pressable onPress={() => setParentStep('closed')} style={styles.cancel}>
          <Text style={styles.link}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  if (!video || !youtubeId) {
    return (
      <View style={[styles.unavailable, { paddingBottom: tabBarHeight }]}>
        <Text style={styles.unavailableText}>Vídeo indisponível</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.link}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const playerWidth = windowWidth - spacing.lg * 2;
  const playerHeight = Math.round((playerWidth * 9) / 16);
  const scrollBottom = tabBarHeight + spacing.md;

  return (
    <View style={styles.root}>
      <PlayerFullscreen
        visible={fullscreen}
        youtubeId={youtubeId}
        maxVolume={profile.maxVolume}
        playing={playing}
        onPlayingChange={setPlaying}
        onSuggestedVideoId={handleSuggestedVideoId}
        onClose={closeFullscreen}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.sm, paddingBottom: scrollBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GestureDetector gesture={panGesture}>
          <View style={styles.playerBlock}>
            <CalmPlayer
              key={video.id}
              youtubeId={youtubeId}
              maxVolume={profile.maxVolume}
              playing={playing && !fullscreen}
              onPlayingChange={setPlaying}
              onSuggestedVideoId={handleSuggestedVideoId}
              width={playerWidth}
              height={playerHeight}
              style={styles.playerRounded}
            />
            {showPlaylist && (
              <Text style={styles.swipeHintText}>
                {hasNext ? 'Deslize no vídeo para o próximo' : ''}
                {hasNext && hasPrev ? ' · ' : ''}
                {hasPrev ? 'ou para o anterior' : ''}
              </Text>
            )}
            <Text style={styles.swipeHintText}>
              Gire o celular para tela cheia · volte ao retrato para sair
            </Text>
          </View>
        </GestureDetector>

        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.channel}>{video.channelTitle}</Text>

          <View style={styles.toolbar}>
            <Pressable style={styles.toolBtn} onPress={() => setPlaying((p) => !p)}>
              <Text style={styles.toolBtnText}>{playing ? 'Pausar' : 'Play'}</Text>
            </Pressable>
            <Pressable
              style={styles.toolBtn}
              onPress={() => {
                if (fullscreen) {
                  closeFullscreen();
                } else {
                  setLandscapeDismissed(false);
                  setPortraitFullscreen(true);
                }
              }}
            >
              <Text style={styles.toolBtnText}>
                {fullscreen ? 'Sair tela cheia' : 'Tela cheia'}
              </Text>
            </Pressable>
            <Pressable style={styles.parentGate} onPress={openParentGate} hitSlop={12}>
              <Text style={styles.parentGateText}>🔒</Text>
            </Pressable>
          </View>
        </View>

        {showPlaylist && (
          <View style={styles.playlistSection}>
            <Text style={styles.playlistTitle}>Nesta lista</Text>
            <View style={styles.playlistList}>
              {queue.map((item, itemIndex) => {
                const isActive = itemIndex === currentIndex;
                return (
                  <View
                    key={item.id}
                    style={[styles.playlistRow, isActive && styles.playlistRowActive]}
                  >
                    {isActive && <Text style={styles.nowPlaying}>▶ Tocando agora</Text>}
                    <VideoCard
                      video={item}
                      compact
                      onPress={() => goToIndex(itemIndex)}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  pinRoot: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  unavailable: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  unavailableText: {
    color: colors.text,
    fontSize: 18,
  },
  playerBlock: {
    gap: spacing.sm,
  },
  playerRounded: {
    borderRadius: radius.md,
  },
  swipeHintText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  meta: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  channel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  toolBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  toolBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  parentGate: {
    marginLeft: 'auto',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    opacity: 0.45,
  },
  parentGateText: {
    fontSize: 16,
  },
  playlistSection: {
    gap: spacing.md,
  },
  playlistTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  playlistList: {
    gap: spacing.sm,
  },
  playlistRow: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  playlistRowActive: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  nowPlaying: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  link: {
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  cancel: {
    marginTop: spacing.xl,
  },
});
