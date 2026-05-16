import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';

type CalmPlayerProps = {
  youtubeId: string;
  maxVolume: number;
  playing: boolean;
  onPlayingChange?: (playing: boolean) => void;
  width: number;
  height: number;
  style?: ViewStyle;
};

export function CalmPlayer({
  youtubeId,
  maxVolume,
  playing,
  onPlayingChange,
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
    },
    [onPlayingChange],
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
