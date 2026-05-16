import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ChildProfile } from '@/types';

const DEFAULT_PROFILE: ChildProfile = {
  id: 'default',
  name: 'Explorer',
  emoji: '🦊',
  avatarColor: '#6b8cce',
  maxVolume: 60,
  blockedVideoIds: [],
  blockedChannelIds: [],
};

type AppState = {
  parentPin: string | null;
  profiles: ChildProfile[];
  activeProfileId: string | null;

  setParentPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  hasPin: () => boolean;

  setActiveProfile: (id: string | null) => void;
  addProfile: (profile: Omit<ChildProfile, 'id' | 'blockedVideoIds' | 'blockedChannelIds'>) => void;
  updateProfile: (id: string, patch: Partial<ChildProfile>) => void;
  removeProfile: (id: string) => void;

  getActiveProfile: () => ChildProfile | null;
  blockVideo: (profileId: string, videoId: string) => void;
  blockChannel: (profileId: string, channelId: string) => void;
  isVideoBlocked: (profileId: string, videoId: string) => boolean;
  isChannelBlocked: (profileId: string, channelId: string) => boolean;
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

      setParentPin: (pin) => set({ parentPin: pin }),

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
    }),
    {
      name: 'calmdowntube-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        parentPin: state.parentPin,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('[CalmDownTube] Failed to load saved data:', error);
        }
      },
    },
  ),
);
