import { useMemo } from 'react';

import { approvedChannels, type ApprovedChannel } from '@/constants/approvedChannels';
import { useAppStore } from '@/store/useAppStore';

export function useApprovedChannels(): ApprovedChannel[] {
  const customChannels = useAppStore((s) => s.customChannels);

  return useMemo(
    () => [
      ...approvedChannels,
      ...customChannels.map((ch) => ({
        slug: ch.slug,
        title: ch.title,
        youtubeChannelId: ch.youtubeChannelId,
        maxVideos: 8,
      })),
    ],
    [customChannels],
  );
}

function isChannelVisibleForProfile(
  slug: string,
  profileId: string | null,
  isChannelHidden: (profileId: string, slug: string) => boolean,
  isChannelBlocked: (profileId: string, channelId: string) => boolean,
) {
  if (!profileId) return false;
  if (isChannelHidden(profileId, slug)) return false;
  if (isChannelBlocked(profileId, slug)) return false;
  return true;
}

/** Canais oficiais + personalizados visíveis para o perfil ativo. */
export function useVisibleChannels(): ApprovedChannel[] {
  const allChannels = useApprovedChannels();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const isChannelHidden = useAppStore((s) => s.isChannelHidden);
  const isChannelBlocked = useAppStore((s) => s.isChannelBlocked);

  return useMemo(
    () =>
      allChannels.filter((ch) =>
        isChannelVisibleForProfile(
          ch.slug,
          activeProfileId,
          isChannelHidden,
          isChannelBlocked,
        ),
      ),
    [allChannels, activeProfileId, isChannelHidden, isChannelBlocked],
  );
}

export function useCustomChannels() {
  return useAppStore((s) => s.customChannels);
}
