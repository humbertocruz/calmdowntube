import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveYoutubeId } from '@/constants/content';
import { colors, radius, spacing } from '@/constants/theme';
import type { VideoItem } from '@/types';

type VideoCardProps = {
  video: VideoItem;
  onPress: () => void;
  compact?: boolean;
};

export function VideoCard({ video, onPress, compact }: VideoCardProps) {
  const ytId = resolveYoutubeId(video);
  const thumb =
    video.thumbnailUrl ??
    (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}
    >
      <View style={[styles.thumbWrap, compact && styles.thumbCompact]}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.channel} numberOfLines={1}>
          {video.channelTitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    flex: 1,
    minWidth: 160,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: undefined,
  },
  pressed: {
    opacity: 0.9,
  },
  thumbWrap: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceElevated,
  },
  thumbCompact: {
    width: 120,
    aspectRatio: 16 / 9,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    backgroundColor: colors.surfaceElevated,
  },
  info: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  channel: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
