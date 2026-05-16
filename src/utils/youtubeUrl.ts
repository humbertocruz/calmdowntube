import type { VideoItem } from '@/types';
import { resolveYoutubeId } from '@/constants/content';

const EMBED_HOST = 'https://lonelycpp.github.io/react-native-youtube-iframe/';

const YOUTUBE_HOSTS = [/youtube\.com/i, /youtu\.be/i, /m\.youtube\.com/i];

/** Extrai o ID de um link watch / youtu.be / embed. */
export function parseYoutubeVideoIdFromUrl(url: string): string | null {
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch?.[1]) return watch[1];

  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short?.[1]) return short[1];

  const embed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed?.[1]) return embed[1];

  const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shorts?.[1]) return shorts[1];

  return null;
}

export type YoutubeEmbedNavigation =
  | { type: 'allow' }
  | { type: 'block' }
  | { type: 'video'; youtubeVideoId: string };

export function resolveYoutubeEmbedNavigation(url: string): YoutubeEmbedNavigation {
  if (!url || url === 'about:blank') {
    return { type: 'allow' };
  }
  if (url.startsWith(EMBED_HOST)) {
    return { type: 'allow' };
  }

  const youtubeVideoId = parseYoutubeVideoIdFromUrl(url);
  if (youtubeVideoId && YOUTUBE_HOSTS.some((pattern) => pattern.test(url))) {
    return { type: 'video', youtubeVideoId };
  }

  if (YOUTUBE_HOSTS.some((pattern) => pattern.test(url))) {
    return { type: 'block' };
  }

  return { type: 'allow' };
}

export function findVideoByYoutubeId(
  items: VideoItem[],
  youtubeVideoId: string,
): VideoItem | undefined {
  return items.find((v) => resolveYoutubeId(v) === youtubeVideoId);
}

export function suggestedVideoItem(
  youtubeVideoId: string,
  context: VideoItem,
): VideoItem {
  return {
    id: `yt-${youtubeVideoId}`,
    title: 'Vídeo do canal',
    channelId: context.channelId,
    channelTitle: context.channelTitle,
    youtubeVideoId,
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`,
  };
}
