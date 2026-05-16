import { approvedChannels, type ApprovedChannel } from '@/constants/approvedChannels';
import { isResultAllowed } from '@/constants/searchFilters';
import type { VideoItem } from '@/types';

const FEED_CACHE_KEY = 'calmdowntube-channel-feed-cache';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

type FeedCache = {
  savedAt: number;
  videos: VideoItem[];
};

function decodeXml(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function isShortForm(title: string) {
  const t = title.toLowerCase();
  return t.includes('#shorts') || t.includes('#short') || /\bshorts\b/.test(t);
}

function parseRssEntries(xml: string, channelSlug: string, channelTitle: string) {
  const videos: VideoItem[] = [];
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  for (const entry of entries) {
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const rawTitle = entry.match(/<title>([^<]*)<\/title>/)?.[1];
    if (!videoId || !rawTitle) continue;

    const title = decodeXml(rawTitle).trim();
    if (isShortForm(title)) continue;
    if (!isResultAllowed(title, '')) continue;

    videos.push({
      id: `yt-${videoId}`,
      title,
      channelId: channelSlug,
      channelTitle,
      youtubeVideoId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    });
  }

  return videos;
}

export async function fetchChannelVideos(
  youtubeChannelId: string,
  channelSlug: string,
  channelTitle: string,
  maxVideos: number,
) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannelId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Feed indisponível (${response.status})`);
  }
  const xml = await response.text();
  return parseRssEntries(xml, channelSlug, channelTitle).slice(0, maxVideos);
}

export async function fetchApprovedChannelVideos(
  channels: ApprovedChannel[] = approvedChannels,
): Promise<VideoItem[]> {
  const results = await Promise.allSettled(
    channels.map((ch) =>
      fetchChannelVideos(ch.youtubeChannelId, ch.slug, ch.title, ch.maxVideos),
    ),
  );

  const merged: VideoItem[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const video of result.value) {
      if (seen.has(video.youtubeVideoId!)) continue;
      seen.add(video.youtubeVideoId!);
      merged.push(video);
    }
  }

  return merged;
}

export async function loadCachedOrFreshFeed(
  storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem?: (key: string) => Promise<void>;
  },
  forceRefresh = false,
  channels: ApprovedChannel[] = approvedChannels,
): Promise<VideoItem[]> {
  if (!forceRefresh) {
    try {
      const raw = await storage.getItem(FEED_CACHE_KEY);
      if (raw) {
        const cache = JSON.parse(raw) as FeedCache;
        if (Date.now() - cache.savedAt < CACHE_TTL_MS) {
          return cache.videos;
        }
      }
    } catch {
      // ignore corrupt cache
    }
  }

  const videos = await fetchApprovedChannelVideos(channels);
  const payload: FeedCache = { savedAt: Date.now(), videos };
  try {
    await storage.setItem(FEED_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // cache optional
  }
  return videos;
}
