import { useMemo } from 'react';

import {
  FEED_PLAYLIST_ID,
  categories,
  getPlaylist,
  getVideo,
  homeFeedVideoIds,
  playlists,
} from '@/constants/content';
import { CHANNEL_PLAYLIST_ID, SEARCH_PLAYLIST_ID } from '@/constants/searchFilters';
import type { Category, Playlist, VideoItem } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useFeedStore } from '@/store/useFeedStore';

function videoKey(video: VideoItem) {
  return video.youtubeVideoId ?? video.id;
}

function isAllowed(
  video: VideoItem,
  profileId: string,
  isVideoBlocked: (profileId: string, videoId: string) => boolean,
  isChannelBlocked: (profileId: string, channelId: string) => boolean,
) {
  if (isVideoBlocked(profileId, video.id)) return false;
  if (isChannelBlocked(profileId, video.channelId)) return false;
  return true;
}

export function useFilteredContent() {
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const searchPlaylist = useAppStore((s) => s.searchPlaylist);
  const channelPlaylist = useAppStore((s) => s.channelPlaylist);
  const discoveredVideos = useFeedStore((s) => s.discoveredVideos);
  const isVideoBlocked = useAppStore((s) => s.isVideoBlocked);
  const isChannelBlocked = useAppStore((s) => s.isChannelBlocked);

  return useMemo(() => {
    const emptyPlaylistVideos = () => [] as VideoItem[];

    if (!activeProfileId) {
      return {
        categories: [] as Category[],
        playlists: [] as Playlist[],
        videos: [] as VideoItem[],
        getPlaylistVideos: emptyPlaylistVideos,
      };
    }

    const profile = useAppStore.getState().profiles.find((p) => p.id === activeProfileId);
    const hiddenChannelSlugs = profile?.hiddenChannelSlugs ?? [];

    const filteredPlaylists: Playlist[] = playlists
      .filter((playlist) => !hiddenChannelSlugs.includes(playlist.id))
      .map((playlist) => ({
        ...playlist,
        videoIds: playlist.videoIds.filter((vid) => {
          const video = getVideo(vid);
          if (!video) return false;
          return isAllowed(video, activeProfileId, isVideoBlocked, isChannelBlocked);
        }),
      }))
      .filter((p) => p.videoIds.length > 0);

    const filteredCategories: Category[] = categories
      .map((cat) => ({
        ...cat,
        playlistIds: cat.playlistIds.filter((pid) =>
          filteredPlaylists.some((p) => p.id === pid),
        ),
      }))
      .filter((c) => c.playlistIds.length > 0);

    const seen = new Set<string>();
    const videos = filteredPlaylists
      .flatMap((p) => p.videoIds.map((id) => getVideo(id)))
      .filter((v): v is VideoItem => {
        if (!v || seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      });

    return {
      categories: filteredCategories,
      playlists: filteredPlaylists,
      videos,
      getPlaylistVideos: (playlistId: string) => {
        if (playlistId === SEARCH_PLAYLIST_ID) {
          return searchPlaylist.filter((v) =>
            isAllowed(v, activeProfileId, isVideoBlocked, isChannelBlocked),
          );
        }
        if (playlistId === CHANNEL_PLAYLIST_ID) {
          return channelPlaylist.filter((v) =>
            isAllowed(v, activeProfileId, isVideoBlocked, isChannelBlocked),
          );
        }
        if (playlistId === FEED_PLAYLIST_ID) {
          const seen = new Set<string>();
          const merged: VideoItem[] = [];

          const push = (video: VideoItem | undefined) => {
            if (!video) return;
            if (hiddenChannelSlugs.includes(video.channelId)) return;
            if (!isAllowed(video, activeProfileId, isVideoBlocked, isChannelBlocked)) return;
            const key = videoKey(video);
            if (seen.has(key)) return;
            seen.add(key);
            merged.push(video);
          };

          for (const video of discoveredVideos) {
            push(video);
          }
          for (const id of homeFeedVideoIds) {
            push(getVideo(id));
          }

          return merged;
        }
        const playlist = getPlaylist(playlistId);
        if (!playlist) return [];
        return playlist.videoIds
          .map((id) => getVideo(id))
          .filter(
            (v): v is VideoItem =>
              Boolean(v) &&
              isAllowed(v!, activeProfileId, isVideoBlocked, isChannelBlocked),
          );
      },
    };
  }, [
    activeProfileId,
    searchPlaylist,
    channelPlaylist,
    discoveredVideos,
    isVideoBlocked,
    isChannelBlocked,
  ]);
}
