import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';

import { resolveYoutubeEmbedNavigation } from '@/utils/youtubeUrl';

type CalmPlayerProps = {
  youtubeId: string;
  maxVolume: number;
  playing: boolean;
  onPlayingChange?: (playing: boolean) => void;
  /** Toque em sugestão do embed: abre o vídeo no app em vez do YouTube externo. */
  onSuggestedVideoId?: (youtubeVideoId: string) => void;
  width: number;
  height: number;
  style?: ViewStyle;
};

export function CalmPlayer({
  youtubeId,
  maxVolume,
  playing,
  onPlayingChange,
  onSuggestedVideoId,
  width,
  height,
  style,
}: CalmPlayerProps) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [youtubeId]);

  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'playing') onPlayingChange?.(true);
      if (state === 'paused' || state === 'ended') onPlayingChange?.(false);
      if (state === 'ended') {
        playerRef.current?.seekTo(0, true);
      }
    },
    [onPlayingChange],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (request: { url?: string; mainDocumentURL?: string }) => {
      const url = request.mainDocumentURL ?? request.url ?? '';
      if (Platform.OS === 'ios' && url === 'about:blank') {
        return true;
      }

      const nav = resolveYoutubeEmbedNavigation(url);
      if (nav.type === 'video') {
        onSuggestedVideoId?.(nav.youtubeVideoId);
        return false;
      }
      if (nav.type === 'block') {
        return false;
      }
      return true;
    },
    [onSuggestedVideoId],
  );

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      <YoutubePlayer
        ref={playerRef}
        height={height}
        width={width}
        play={playing}
        videoId={youtubeId}
        volume={maxVolume}
        onReady={() => setReady(true)}
        onChangeState={onStateChange}
        forceAndroidAutoplay={false}
        initialPlayerParams={{
          controls: false,
          modestbranding: true,
          rel: false,
          preventFullScreen: true,
          iv_load_policy: 3,
          cc_load_policy: 0,
        }}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: !ready,
          onShouldStartLoadWithRequest,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#000',
  },
});
