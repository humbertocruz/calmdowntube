/** Turn on when a backend proxy serves YouTube search (not client API key). */
export const SEARCH_ENABLED = false;

/** Terms that make a search query invalid (kids typing random things). */
export const QUERY_BLOCKLIST = [
  'shorts',
  '#short',
  'tiktok',
  'free fire',
  'minecraft troll',
  'jumpscare',
  'scream',
  'horror',
  'terror',
  'susto',
  'assust',
  '18+',
  'hot ',
  'sexy',
  'namorad',
  'beij',
  'fight',
  'briga',
  'polícia',
  'arma',
  'gun ',
  'kill',
  'morte',
  'sangue',
  'blood',
  'challenge',
  'desafio extremo',
  'asmr loud',
  'grito',
  'rage',
  'troll',
  'prank',
  'pegadinha',
];

/** If title/description contains these, hide the result. */
export const RESULT_BLOCKLIST = [
  ...QUERY_BLOCKLIST,
  'ao vivo',
  'live stream',
  '24 horas',
  '24h',
  'loop',
  '1 hour',
  '10 hours',
  'compilation',
  'compilado',
  'react',
  'reaction',
  'fiz um',
  'experiment',
  'vlog',
  '#shorts',
  'shorts',
];

/** Suggested safe searches (always append "infantil" in the API query). */
export const SEARCH_SUGGESTIONS = [
  'Mundo Bita',
  'Turma da Mônica',
  'Jacarelvis',
  'Seu Lobato',
  'desenho infantil',
  'música infantil',
  'natureza para crianças',
  'animais para crianças',
];

export const SEARCH_PLAYLIST_ID = '__search__';
export const CHANNEL_PLAYLIST_ID = '__channel__';

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function containsBlockedTerm(text: string, terms: string[]) {
  const normalized = normalizeText(text);
  return terms.some((term) => normalized.includes(normalizeText(term)));
}

export function isQueryAllowed(query: string) {
  const trimmed = query.trim();
  if (trimmed.length < 3) return false;
  return !containsBlockedTerm(trimmed, QUERY_BLOCKLIST);
}

export function isResultAllowed(title: string, description: string) {
  const combined = `${title} ${description}`;
  return !containsBlockedTerm(combined, RESULT_BLOCKLIST);
}
