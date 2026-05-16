import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import type { ApprovedChannel } from '@/constants/approvedChannels';
import { loadCachedOrFreshFeed } from '@/services/youtubeChannelFeed';
import type { VideoItem } from '@/types';

type FeedState = {
  discoveredVideos: VideoItem[];
  feedLoading: boolean;
  feedError: string | null;
  loadDiscoverFeed: (force?: boolean, channels?: ApprovedChannel[]) => Promise<void>;
};

export const useFeedStore = create<FeedState>((set) => ({
  discoveredVideos: [],
  feedLoading: false,
  feedError: null,

  loadDiscoverFeed: async (force = false, channels) => {
    set({ feedLoading: true, feedError: null });
    try {
      const videos = await loadCachedOrFreshFeed(AsyncStorage, force, channels);
      set({ discoveredVideos: videos, feedLoading: false });
    } catch (error) {
      set({
        feedLoading: false,
        feedError: error instanceof Error ? error.message : 'Não foi possível carregar novidades',
      });
    }
  },
}));
