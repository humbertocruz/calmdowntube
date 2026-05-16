type ResolvedChannel = {
  youtubeChannelId: string;
  title: string;
};

function decodeHtml(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractChannelId(html: string) {
  const fromParam = html.match(/channel_id=(UC[\w-]{20,})/)?.[1];
  if (fromParam) return fromParam;
  const fromJson = html.match(/"channelId":"(UC[\w-]{20,})"/)?.[1];
  if (fromJson) return fromJson;
  const fromExternal = html.match(/"externalId":"(UC[\w-]{20,})"/)?.[1];
  return fromExternal ?? null;
}

function extractTitle(html: string) {
  const raw =
    html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ??
    html.match(/<title>([^<]+)<\/title>/)?.[1];
  if (!raw) return null;
  const title = decodeHtml(raw)
    .replace(/\s*-\s*YouTube\s*$/i, '')
    .trim();
  return title || null;
}

function slugifyHandle(query: string) {
  return query
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9._-]+/g, '')
    .slice(0, 40);
}

async function fetchPage(url: string) {
  const response = await fetch(url);
  if (!response.ok) return null;
  const html = await response.text();
  const channelId = extractChannelId(html);
  if (!channelId) return null;
  return {
    youtubeChannelId: channelId,
    title: extractTitle(html) ?? 'Canal do YouTube',
  } satisfies ResolvedChannel;
}

async function tryResolveUrl(url: string) {
  try {
    return await fetchPage(url);
  } catch {
    return null;
  }
}

export async function resolveYoutubeChannel(query: string): Promise<ResolvedChannel> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    throw new Error('Digite pelo menos 2 caracteres.');
  }

  const channelPath = trimmed.match(/youtube\.com\/channel\/(UC[\w-]+)/i)?.[1];
  if (channelPath) {
    const page = await tryResolveUrl(`https://www.youtube.com/channel/${channelPath}`);
    if (page) return page;
  }

  const handlePath = trimmed.match(/youtube\.com\/@([\w.-]+)/i)?.[1];
  if (handlePath) {
    const page = await tryResolveUrl(`https://www.youtube.com/@${handlePath}`);
    if (page) return page;
  }

  const handle = slugifyHandle(trimmed);
  if (handle.length >= 3) {
    const page = await tryResolveUrl(`https://www.youtube.com/@${handle}`);
    if (page) return page;
  }

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmed)}&sp=EgIQAg%253D%253D`;
  const searchPage = await tryResolveUrl(searchUrl);
  if (searchPage) return searchPage;

  const broadSearch = await tryResolveUrl(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmed)}`,
  );
  if (broadSearch) return broadSearch;

  throw new Error(
    'Canal não encontrado. Tente o nome exato, @ do canal ou cole o link do YouTube.',
  );
}

export function customChannelSlug(youtubeChannelId: string) {
  return `custom-${youtubeChannelId}`;
}
