export type ChildProfile = {
  id: string;
  name: string;
  emoji: string;
  avatarColor: string;
  maxVolume: number;
  blockedVideoIds: string[];
  blockedChannelIds: string[];
};

export type VideoItem = {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl?: string;
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
