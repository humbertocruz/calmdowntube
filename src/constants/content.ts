import type { Category, Playlist, VideoItem } from '@/types';

export const videos: Record<string, VideoItem> = {
  // Turma da Mônica Oficial
  'monica-1': {
    id: 'monica-1',
    title: 'Mônica? Que Mônica?',
    channelId: 'turma-monica-oficial',
    channelTitle: 'Turma da Mônica Oficial',
  },
  'monica-2': {
    id: 'monica-2',
    title: 'Coincidências',
    channelId: 'turma-monica-oficial',
    channelTitle: 'Turma da Mônica Oficial',
  },
  // Mundo Bita
  'bita-1': {
    id: 'bita-1',
    title: 'Sinto o que Sinto',
    channelId: 'mundo-bita',
    channelTitle: 'Mundo Bita',
  },
  'bita-2': {
    id: 'bita-2',
    title: 'Farra da Capivara',
    channelId: 'mundo-bita',
    channelTitle: 'Mundo Bita',
  },
  'bita-3': {
    id: 'bita-3',
    title: 'Gostosuras Naturais',
    channelId: 'mundo-bita',
    channelTitle: 'Mundo Bita',
  },
  // A Turma do Seu Lobato
  'lobato-1': {
    id: 'lobato-1',
    title: 'Palavrinhas Mágicas',
    channelId: 'turma-seu-lobato',
    channelTitle: 'A Turma do Seu Lobato',
  },
  'lobato-2': {
    id: 'lobato-2',
    title: 'Mundo Colorido',
    channelId: 'turma-seu-lobato',
    channelTitle: 'A Turma do Seu Lobato',
  },
  // Jacarelvis
  'jacarelvis-1': {
    id: 'jacarelvis-1',
    title: 'Escovo os Dentes',
    channelId: 'jacarelvis',
    channelTitle: 'Jacarelvis e Amigos',
  },
  'jacarelvis-2': {
    id: 'jacarelvis-2',
    title: 'Banho eu vou tomar',
    channelId: 'jacarelvis',
    channelTitle: 'Jacarelvis e Amigos',
  },
  'jacarelvis-3': {
    id: 'jacarelvis-3',
    title: 'Bola',
    channelId: 'jacarelvis',
    channelTitle: 'Jacarelvis e Amigos',
  },
  'jacarelvis-4': {
    id: 'jacarelvis-4',
    title: 'Tem que limpar',
    channelId: 'jacarelvis',
    channelTitle: 'Jacarelvis e Amigos',
  },
};

export const youtubeIds: Record<string, string> = {
  'monica-1': 'bDmfkZslsjY',
  'monica-2': 'Wfc9wVFm9qg',
  'bita-1': 'OEUXZ2uz1a4',
  'bita-2': '3gtnv4cmcmg',
  'bita-3': 's6hFi6aUBoQ',
  'lobato-1': 'Mn-KI0FuEZ0',
  'lobato-2': 'gSEu2od18PQ',
  'jacarelvis-1': 'v7pxOOZq0Cg',
  'jacarelvis-2': 'Mc0kHtMCaGA',
  'jacarelvis-3': 'pmjKQvP6WHY',
  'jacarelvis-4': '-TO9s-5gq-w',
};

export const playlists: Playlist[] = [
  {
    id: 'turma-monica-oficial',
    title: 'Turma da Mônica Oficial',
    description: 'Episódios oficiais da Turma da Mônica',
    emoji: '💛',
    videoIds: ['monica-1', 'monica-2'],
  },
  {
    id: 'mundo-bita',
    title: 'Mundo Bita',
    description: 'Músicas e clipes oficiais do Mundo Bita',
    emoji: '🎵',
    videoIds: ['bita-1', 'bita-2', 'bita-3'],
  },
  {
    id: 'turma-seu-lobato',
    title: 'A Turma do Seu Lobato',
    description: 'Músicas infantis oficiais do Seu Lobato',
    emoji: '🌾',
    videoIds: ['lobato-1', 'lobato-2'],
  },
  {
    id: 'jacarelvis',
    title: 'Jacarelvis',
    description: 'Clipes oficiais do Jacarelvis e Amigos',
    emoji: '🐊',
    videoIds: ['jacarelvis-1', 'jacarelvis-2', 'jacarelvis-3', 'jacarelvis-4'],
  },
];

export const categories: Category[] = [
  {
    id: 'canais',
    title: 'Canais',
    emoji: '📺',
    playlistIds: [
      'turma-monica-oficial',
      'mundo-bita',
      'turma-seu-lobato',
      'jacarelvis',
    ],
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
