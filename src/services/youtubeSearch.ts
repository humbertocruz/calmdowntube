import {
  SEARCH_ENABLED,
  isQueryAllowed,
  isResultAllowed,
} from '@/constants/searchFilters';
import type { VideoItem } from '@/types';

type YoutubeSearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    thumbnails?: { medium?: { url?: string } };
  };
};

type YoutubeSearchResponse = {
  items?: YoutubeSearchItem[];
  error?: { message?: string };
};

type YoutubeVideosResponse = {
  items?: { id: string; contentDetails?: { duration?: string } }[];
};

function getApiKey() {
  return process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ?? '';
}

/** ISO 8601 duration → seconds (filters very short clips). */
function parseDurationSeconds(iso: string) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = Number(match[1] ?? 0);
  const m = Number(match[2] ?? 0);
  const s = Number(match[3] ?? 0);
  return h * 3600 + m * 60 + s;
}

export function hasYoutubeSearchConfigured() {
  return SEARCH_ENABLED && getApiKey().length > 10;
}

export async function searchSafeVideos(query: string): Promise<VideoItem[]> {
  if (!SEARCH_ENABLED) {
    throw new Error('Busca desativada nesta versão do app.');
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'Busca não configurada. Adicione EXPO_PUBLIC_YOUTUBE_API_KEY no arquivo .env',
    );
  }

  if (!isQueryAllowed(query)) {
    throw new Error('Termo de busca não permitido. Tente outra palavra.');
  }

  const safeQuery = `${query.trim()} infantil`;
  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: safeQuery,
    type: 'video',
    safeSearch: 'strict',
    videoEmbeddable: 'true',
    maxResults: '20',
    relevanceLanguage: 'pt',
    key: apiKey,
  });

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${searchParams}`,
  );
  const searchJson = (await searchRes.json()) as YoutubeSearchResponse;

  if (!searchRes.ok) {
    throw new Error(searchJson.error?.message ?? 'Erro ao buscar vídeos');
  }

  const candidates = (searchJson.items ?? []).filter(
    (item) =>
      item.id.videoId &&
      isResultAllowed(item.snippet.title, item.snippet.description),
  );

  if (candidates.length === 0) return [];

  const videoIds = candidates
    .map((item) => item.id.videoId!)
    .slice(0, 15)
    .join(',');

  const detailsParams = new URLSearchParams({
    part: 'contentDetails',
    id: videoIds,
    key: apiKey,
  });

  const detailsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${detailsParams}`,
  );
  const detailsJson = (await detailsRes.json()) as YoutubeVideosResponse;

  const durationById = new Map<string, number>();
  for (const item of detailsJson.items ?? []) {
    if (item.contentDetails?.duration) {
      durationById.set(item.id, parseDurationSeconds(item.contentDetails.duration));
    }
  }

  const videos: VideoItem[] = [];

  for (const item of candidates) {
    const ytId = item.id.videoId!;
    const seconds = durationById.get(ytId) ?? 0;
    if (seconds > 0 && seconds < 45) continue;

    videos.push({
      id: `yt-${ytId}`,
      title: item.snippet.title,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url,
      youtubeVideoId: ytId,
    });

    if (videos.length >= 12) break;
  }

  return videos;
}
