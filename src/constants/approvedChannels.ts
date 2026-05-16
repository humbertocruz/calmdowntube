/** Canais oficiais — novos uploads entram no Início via RSS público do YouTube. */
export type ApprovedChannel = {
  slug: string;
  title: string;
  youtubeChannelId: string;
  maxVideos: number;
};

export const approvedChannels: ApprovedChannel[] = [
  {
    slug: 'turma-monica-oficial',
    title: 'Turma da Mônica Oficial',
    youtubeChannelId: 'UCV4XcEqBswMCryorV_gNENw',
    maxVideos: 8,
  },
  {
    slug: 'mundo-bita',
    title: 'Mundo Bita',
    youtubeChannelId: 'UC0cGVh96osM7yqMu0ENSKKQ',
    maxVideos: 8,
  },
  {
    slug: 'turma-seu-lobato',
    title: 'A Turma do Seu Lobato',
    youtubeChannelId: 'UC2aeRQWLaIdNCXWGE2Bkdow',
    maxVideos: 6,
  },
  {
    slug: 'jacarelvis',
    title: 'Jacarelvis e Amigos',
    youtubeChannelId: 'UCfSXnTF0LZPPc9nIJQMLHEA',
    maxVideos: 6,
  },
];
