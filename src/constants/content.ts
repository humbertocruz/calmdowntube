import type { Category, Playlist, VideoItem } from '@/types';

/** Curated calm content — no algorithmic feed. Expand via parent settings later. */
export const videos: Record<string, VideoItem> = {
  'aquarium-1': {
    id: 'aquarium-1',
    title: 'Peaceful Aquarium',
    channelId: 'calm-nature',
    channelTitle: 'Calm Nature',
  },
  'space-1': {
    id: 'space-1',
    title: 'Slow Journey Through the Stars',
    channelId: 'calm-space',
    channelTitle: 'Calm Space',
  },
  'forest-1': {
    id: 'forest-1',
    title: 'Rainforest Ambience',
    channelId: 'calm-nature',
    channelTitle: 'Calm Nature',
  },
  'ocean-1': {
    id: 'ocean-1',
    title: 'Gentle Ocean Waves',
    channelId: 'calm-nature',
    channelTitle: 'Calm Nature',
  },
  'draw-1': {
    id: 'draw-1',
    title: 'Slow Drawing for Kids',
    channelId: 'calm-create',
    channelTitle: 'Calm Create',
  },
  'piano-1': {
    id: 'piano-1',
    title: 'Soft Piano for Relaxing',
    channelId: 'calm-sounds',
    channelTitle: 'Calm Sounds',
  },
};

/** YouTube video IDs mapped from internal keys */
export const youtubeIds: Record<string, string> = {
  'aquarium-1': '1-iS7LArHPo',
  'space-1': '86YLFOog4GM',
  'forest-1': 'xNN7iTA57jM',
  'ocean-1': '1ZYbU82GVz4',
  'draw-1': '5y8A7A4HkKU',
  'piano-1': 'nDq6TstdEi8',
};

export const playlists: Playlist[] = [
  {
    id: 'nature',
    title: 'Nature & Calm',
    description: 'Slow, peaceful scenes from the natural world',
    emoji: '🌿',
    videoIds: ['aquarium-1', 'forest-1', 'ocean-1'],
  },
  {
    id: 'space',
    title: 'Space & Wonder',
    description: 'Gentle exploration without chaos',
    emoji: '🪐',
    videoIds: ['space-1'],
  },
  {
    id: 'create',
    title: 'Create & Listen',
    description: 'Drawing and soft music',
    emoji: '🎨',
    videoIds: ['draw-1', 'piano-1'],
  },
];

export const categories: Category[] = [
  {
    id: 'explore',
    title: 'Explore',
    emoji: '✨',
    playlistIds: ['nature', 'space', 'create'],
  },
];

export function getVideo(id: string): VideoItem | undefined {
  return videos[id];
}

export function getYoutubeId(internalId: string): string | undefined {
  return youtubeIds[internalId];
}

export function getPlaylist(id: string): Playlist | undefined {
  return playlists.find((p) => p.id === id);
}
