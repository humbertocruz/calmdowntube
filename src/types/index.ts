export type ChildProfile = {
  id: string;
  name: string;
  emoji: string;
  avatarColor: string;
  maxVolume: number;
  blockedVideoIds: string[];
  blockedChannelIds: string[];
  /** Canais removidos pelos pais neste perfil (oficiais ou ocultos). */
  hiddenChannelSlugs: string[];
};

export type VideoItem = {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl?: string;
  /** When set (e.g. search results), used instead of the curated youtubeIds map. */
  youtubeVideoId?: string;
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  videoIds: string[];
};

export type Category = {
  id: string;
  title: string;
  emoji: string;
  playlistIds: string[];
};

export type CustomChannel = {
  slug: string;
  title: string;
  youtubeChannelId: string;
};
