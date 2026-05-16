import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalmPlayer } from '@/components/CalmPlayer';
import { colors, radius, spacing } from '@/constants/theme';

type PlayerFullscreenProps = {
  visible: boolean;
  youtubeId: string;
  maxVolume: number;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  onClose: () => void;
};

export function PlayerFullscreen({
  visible,
  youtubeId,
  maxVolume,
  playing,
  onPlayingChange,
  onClose,
}: PlayerFullscreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDeviceLandscape = width > height;

  const playerWidth = isDeviceLandscape
    ? width
    : height - insets.top - insets.bottom;
  const playerHeight = isDeviceLandscape ? height : width;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.playerWrap,
            !isDeviceLandscape && {
              width: playerWidth,
              height: playerHeight,
              transform: [{ rotate: '90deg' }],
            },
          ]}
        >
          <CalmPlayer
            youtubeId={youtubeId}
            maxVolume={maxVolume}
            playing={playing}
            onPlayingChange={onPlayingChange}
            width={playerWidth}
            height={playerHeight}
          />
        </View>

        <View style={[styles.controls, { top: insets.top + spacing.sm }]}>
          <Pressable style={styles.btn} onPress={() => onPlayingChange(!playing)}>
            <Text style={styles.btnText}>{playing ? 'Pausar' : 'Play'}</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>
              {isDeviceLandscape ? 'Voltar ao retrato' : 'Sair da tela cheia'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    right: spacing.lg,
    gap: spacing.sm,
    zIndex: 10,
  },
  btn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
