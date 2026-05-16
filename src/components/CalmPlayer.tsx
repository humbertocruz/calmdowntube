import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';

type CalmPlayerProps = {
  youtubeId: string;
  maxVolume: number;
  playing: boolean;
  onPlayingChange?: (playing: boolean) => void;
};

export function CalmPlayer({
  youtubeId,
  maxVolume,
  playing,
  onPlayingChange,
}: CalmPlayerProps) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [ready, setReady] = useState(false);

  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'playing') onPlayingChange?.(true);
      if (state === 'paused' || state === 'ended') onPlayingChange?.(false);
    },
    [onPlayingChange],
  );

  return (
    <View style={styles.wrap}>
      <YoutubePlayer
        ref={playerRef}
        height={220}
        width="100%"
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
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
});
