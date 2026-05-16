import { useMemo } from 'react';

import { categories, getPlaylist, getVideo, playlists } from '@/constants/content';
import type { Category, Playlist, VideoItem } from '@/types';
import { useAppStore } from '@/store/useAppStore';

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

    const filteredPlaylists: Playlist[] = playlists
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

    const videos = filteredPlaylists.flatMap((p) =>
      p.videoIds.map((id) => getVideo(id)).filter((v): v is VideoItem => Boolean(v)),
    );

    return {
      categories: filteredCategories,
      playlists: filteredPlaylists,
      videos,
      getPlaylistVideos: (playlistId: string) => {
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
  }, [activeProfileId, isVideoBlocked, isChannelBlocked]);
}
