import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import { VideoCard } from '@/components/VideoCard';
import {
  SEARCH_ENABLED,
  SEARCH_PLAYLIST_ID,
  SEARCH_SUGGESTIONS,
} from '@/constants/searchFilters';
import type { VideoItem } from '@/types';
import { colors, radius, spacing } from '@/constants/theme';
import { hasYoutubeSearchConfigured, searchSafeVideos } from '@/services/youtubeSearch';
import { useAppStore } from '@/store/useAppStore';

export default function SearchScreen() {
  const setSearchPlaylist = useAppStore((s) => s.setSearchPlaylist);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!SEARCH_ENABLED) {
      router.replace('/(child)/browse');
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VideoItem[]>([]);

  const runSearch = async (text: string) => {
    const q = text.trim();
    if (q.length < 3) {
      Alert.alert('Busca curta', 'Digite pelo menos 3 letras.');
      return;
    }

    if (!hasYoutubeSearchConfigured()) {
      Alert.alert(
        'Busca indisponível',
        'Configure EXPO_PUBLIC_YOUTUBE_API_KEY no arquivo .env e reinicie o app.\n\nVeja .env.example na raiz do projeto.',
      );
      return;
    }

    setLoading(true);
    try {
      const videos = await searchSafeVideos(q);
      setResults(videos);
      if (videos.length === 0) {
        Alert.alert('Nenhum resultado', 'Tente outras palavras ou uma sugestão abaixo.');
      }
    } catch (error) {
      Alert.alert(
        'Busca não concluída',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    } finally {
      setLoading(false);
    }
  };

  const openVideo = (videoId: string, index: number) => {
    setSearchPlaylist(results);
    router.push({
      pathname: '/player',
      params: {
        videoId,
        playlistId: SEARCH_PLAYLIST_ID,
        index: String(index),
      },
    });
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(child)/browse');
    }
  };

  if (!SEARCH_ENABLED) {
    return null;
  }

  return (
    <Screen
      title="Buscar"
      subtitle="Só resultados filtrados: infantil, sem shorts e termos bloqueados"
      onBack={goBack}
      backLabel="Canais"
      headerRight={
        <Pressable onPress={() => router.replace('/')} hitSlop={8}>
          <Text style={styles.homeLink}>Início</Text>
        </Pressable>
      }
    >
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Ex.: galinha pintadinha"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => runSearch(query)}
          returnKeyType="search"
          autoCorrect={false}
        />
        <Pressable
          style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
          onPress={() => runSearch(query)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={styles.searchBtnText}>Buscar</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.label}>Sugestões seguras</Text>
      <View style={styles.chips}>
        {SEARCH_SUGGESTIONS.map((suggestion) => (
          <Pressable
            key={suggestion}
            style={styles.chip}
            onPress={() => {
              setQuery(suggestion);
              runSearch(suggestion);
            }}
          >
            <Text style={styles.chipText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>

      {!hasYoutubeSearchConfigured() && (
        <Text style={styles.hint}>
          Para ativar a busca, crie uma chave na Google Cloud (YouTube Data API v3) e coloque em
          .env como EXPO_PUBLIC_YOUTUBE_API_KEY.
        </Text>
      )}

      <View style={styles.results}>
        {results.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            compact
            onPress={() => openVideo(video.id, index)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  homeLink: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    minWidth: 88,
    alignItems: 'center',
  },
  searchBtnDisabled: {
    opacity: 0.7,
  },
  searchBtnText: {
    color: colors.text,
    fontWeight: '700',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  results: {
    gap: spacing.md,
  },
});
