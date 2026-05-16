import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { approvedChannels } from '@/constants/approvedChannels';
import { customChannelSlug } from '@/services/youtubeChannelResolver';
import type { ChildProfile, CustomChannel, VideoItem } from '@/types';

const FEED_CACHE_KEY = 'calmdowntube-channel-feed-cache';

const DEFAULT_PROFILE: ChildProfile = {
  id: 'default',
  name: 'Explorer',
  emoji: '🦊',
  avatarColor: '#6b8cce',
  maxVolume: 60,
  blockedVideoIds: [],
  blockedChannelIds: [],
  hiddenChannelSlugs: [],
};

type AppState = {
  parentPin: string | null;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  searchPlaylist: VideoItem[];
  channelPlaylist: VideoItem[];
  customChannels: CustomChannel[];

  setParentPin: (pin: string) => void;
  setSearchPlaylist: (videos: VideoItem[]) => void;
  clearSearchPlaylist: () => void;
  setChannelPlaylist: (videos: VideoItem[]) => void;
  verifyPin: (pin: string) => boolean;
  hasPin: () => boolean;

  setActiveProfile: (id: string | null) => void;
  addProfile: (
    profile: Omit<
      ChildProfile,
      'id' | 'blockedVideoIds' | 'blockedChannelIds' | 'hiddenChannelSlugs'
    >,
  ) => void;
  updateProfile: (id: string, patch: Partial<ChildProfile>) => void;
  removeProfile: (id: string) => void;

  getActiveProfile: () => ChildProfile | null;
  blockVideo: (profileId: string, videoId: string) => void;
  blockChannel: (profileId: string, channelId: string) => void;
  hideChannel: (profileId: string, slug: string) => void;
  isVideoBlocked: (profileId: string, videoId: string) => boolean;
  isChannelBlocked: (profileId: string, channelId: string) => boolean;
  isChannelHidden: (profileId: string, slug: string) => boolean;

  addCustomChannel: (channel: Omit<CustomChannel, 'slug'> & { slug?: string }) => void;
  removeCustomChannel: (slug: string) => void;
  hasCustomChannel: (youtubeChannelId: string) => boolean;
  isKnownChannel: (youtubeChannelId: string) => boolean;
};

function createId() {
  return `profile-${Date.now().toString(36)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      parentPin: null,
      profiles: [DEFAULT_PROFILE],
      activeProfileId: null,
      searchPlaylist: [],
      channelPlaylist: [],
      customChannels: [],

      setParentPin: (pin) => set({ parentPin: pin }),

      setSearchPlaylist: (videos) => set({ searchPlaylist: videos }),

      clearSearchPlaylist: () => set({ searchPlaylist: [] }),

      setChannelPlaylist: (videos) => set({ channelPlaylist: videos }),

      verifyPin: (pin) => get().parentPin === pin,

      hasPin: () => Boolean(get().parentPin),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      addProfile: (profile) =>
        set((state) => ({
          profiles: [
            ...state.profiles,
            {
              ...profile,
              id: createId(),
              blockedVideoIds: [],
              blockedChannelIds: [],
              hiddenChannelSlugs: [],
            },
          ],
        })),

      updateProfile: (id, patch) =>
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      removeProfile: (id) =>
        set((state) => {
          const profiles = state.profiles.filter((p) => p.id !== id);
          return {
            profiles: profiles.length > 0 ? profiles : [DEFAULT_PROFILE],
            activeProfileId:
              state.activeProfileId === id ? null : state.activeProfileId,
          };
        }),

      getActiveProfile: () => {
        const { activeProfileId, profiles } = get();
        if (!activeProfileId) return null;
        return profiles.find((p) => p.id === activeProfileId) ?? null;
      },

      blockVideo: (profileId, videoId) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId && !p.blockedVideoIds.includes(videoId)
              ? { ...p, blockedVideoIds: [...p.blockedVideoIds, videoId] }
              : p,
          ),
        })),

      blockChannel: (profileId, channelId) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId && !p.blockedChannelIds.includes(channelId)
              ? { ...p, blockedChannelIds: [...p.blockedChannelIds, channelId] }
              : p,
          ),
        })),

      isVideoBlocked: (profileId, videoId) => {
        const profile = get().profiles.find((p) => p.id === profileId);
        return profile?.blockedVideoIds.includes(videoId) ?? false;
      },

      isChannelBlocked: (profileId, channelId) => {
        const profile = get().profiles.find((p) => p.id === profileId);
        return profile?.blockedChannelIds.includes(channelId) ?? false;
      },

      hideChannel: (profileId, slug) =>
        set((state) => ({
          profiles: state.profiles.map((p) => {
            if (p.id !== profileId) return p;
            const hidden = p.hiddenChannelSlugs ?? [];
            if (hidden.includes(slug)) return p;
            return { ...p, hiddenChannelSlugs: [...hidden, slug] };
          }),
        })),

      isChannelHidden: (profileId, slug) => {
        const profile = get().profiles.find((p) => p.id === profileId);
        return profile?.hiddenChannelSlugs?.includes(slug) ?? false;
      },

      addCustomChannel: (channel) =>
        set((state) => {
          const slug = channel.slug ?? customChannelSlug(channel.youtubeChannelId);
          if (state.customChannels.some((c) => c.slug === slug)) {
            return state;
          }
          return {
            customChannels: [
              ...state.customChannels,
              {
                slug,
                title: channel.title,
                youtubeChannelId: channel.youtubeChannelId,
              },
            ],
          };
        }),

      removeCustomChannel: (slug) =>
        set((state) => ({
          customChannels: state.customChannels.filter((c) => c.slug !== slug),
        })),

      hasCustomChannel: (youtubeChannelId) =>
        get().customChannels.some((c) => c.youtubeChannelId === youtubeChannelId),

      isKnownChannel: (youtubeChannelId) =>
        approvedChannels.some((c) => c.youtubeChannelId === youtubeChannelId) ||
        get().customChannels.some((c) => c.youtubeChannelId === youtubeChannelId),
    }),
    {
      name: 'calmdowntube-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        parentPin: state.parentPin,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        customChannels: state.customChannels,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('[CalmDownTube] Failed to load saved data:', error);
        }
      },
    },
  ),
);
