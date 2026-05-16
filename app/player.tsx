import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CalmPlayer } from '@/components/CalmPlayer';
import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { getVideo, getYoutubeId } from '@/constants/content';
import { colors, radius, spacing } from '@/constants/theme';
import { useFilteredContent } from '@/hooks/useFilteredContent';
import { useAppStore } from '@/store/useAppStore';

export default function PlayerScreen() {
  const { videoId, playlistId, index } = useLocalSearchParams<{
    videoId: string;
    playlistId?: string;
    index?: string;
  }>();

  const profile = useAppStore((s) => s.getActiveProfile());
  const blockVideo = useAppStore((s) => s.blockVideo);
  const blockChannel = useAppStore((s) => s.blockChannel);
  const verifyPin = useAppStore((s) => s.verifyPin);

  const { getPlaylistVideos } = useFilteredContent();
  const video = videoId ? getVideo(videoId) : undefined;
  const youtubeId = videoId ? getYoutubeId(videoId) : undefined;

  const [playing, setPlaying] = useState(true);
  const [pinModal, setPinModal] = useState<'block-video' | 'block-channel' | null>(null);
  const [pin, setPin] = useState('');

  const playlistVideos = useMemo(
    () => (playlistId ? getPlaylistVideos(playlistId) : []),
    [playlistId, getPlaylistVideos],
  );

  const currentIndex = index ? Number(index) : 0;
  const nextVideo = playlistVideos[currentIndex + 1];

  const goNext = useCallback(() => {
    if (!nextVideo || !playlistId) return;
    router.replace({
      pathname: '/player',
      params: {
        videoId: nextVideo.id,
        playlistId,
        index: String(currentIndex + 1),
      },
    });
  }, [nextVideo, playlistId, currentIndex]);

  const runWithPin = (action: 'block-video' | 'block-channel') => {
    setPin('');
    setPinModal(action);
  };

  if (!profile || !video || !youtubeId) {
    return (
      <Screen title="Video unavailable">
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </Screen>
    );
  }

  if (pinModal) {
    return (
      <Screen scroll={false}>
        <PinPad
          value={pin}
          onChange={(v) => {
            setPin(v);
            if (v.length === 4) {
              setTimeout(() => {
                const ok = verifyPin(v);
                if (!ok) {
                  Alert.alert('Wrong PIN');
                  setPin('');
                  return;
                }
                if (pinModal === 'block-video') {
                  blockVideo(profile.id, video.id);
                  router.back();
                } else {
                  blockChannel(profile.id, video.channelId);
                  router.back();
                }
                setPinModal(null);
              }, 0);
            }
          }}
          title="Parent PIN"
          subtitle={
            pinModal === 'block-video'
              ? 'Confirm to block this video'
              : 'Confirm to block this channel'
          }
        />
        <Pressable onPress={() => setPinModal(null)} style={styles.cancel}>
          <Text style={styles.link}>Cancel</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} title={video.title} subtitle={video.channelTitle}>
      <CalmPlayer
        youtubeId={youtubeId}
        maxVolume={profile.maxVolume}
        playing={playing}
        onPlayingChange={setPlaying}
      />

      <View style={styles.controls}>
        <Pressable
          style={styles.controlBtn}
          onPress={() => setPlaying((p) => !p)}
        >
          <Text style={styles.controlBtnText}>{playing ? 'Pause' : 'Play'}</Text>
        </Pressable>
        {nextVideo ? (
          <Pressable style={[styles.controlBtn, styles.primaryBtn]} onPress={goNext}>
            <Text style={styles.controlBtnText}>Next</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.parentActions}>
        <Text style={styles.parentLabel}>Parent actions</Text>
        <View style={styles.parentRow}>
          <Pressable
            style={styles.dangerBtn}
            onPress={() => runWithPin('block-video')}
          >
            <Text style={styles.dangerBtnText}>Block video</Text>
          </Pressable>
          <Pressable
            style={styles.dangerBtn}
            onPress={() => runWithPin('block-channel')}
          >
            <Text style={styles.dangerBtnText}>Block channel</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.accentSoft,
  },
  controlBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  parentActions: {
    marginTop: 'auto',
    gap: spacing.sm,
    paddingTop: spacing.xl,
  },
  parentLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  parentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dangerBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 14,
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
