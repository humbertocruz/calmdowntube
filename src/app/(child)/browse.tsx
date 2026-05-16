import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AddChannelForm } from '@/components/AddChannelForm';
import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { SEARCH_ENABLED } from '@/constants/searchFilters';
import { colors, radius, spacing } from '@/constants/theme';
import { useCustomChannels, useVisibleChannels } from '@/hooks/useApprovedChannels';
import { useFilteredContent } from '@/hooks/useFilteredContent';
import { useAppStore } from '@/store/useAppStore';
import { useFeedStore } from '@/store/useFeedStore';

export default function ChildBrowseScreen() {
  const profile = useAppStore((s) => s.getActiveProfile());
  const verifyPin = useAppStore((s) => s.verifyPin);
  const hideChannel = useAppStore((s) => s.hideChannel);
  const removeCustomChannel = useAppStore((s) => s.removeCustomChannel);
  const customChannels = useCustomChannels();
  const visibleChannels = useVisibleChannels();
  const { categories, playlists } = useFilteredContent();
  const loadDiscoverFeed = useFeedStore((s) => s.loadDiscoverFeed);

  const [showAddChannel, setShowAddChannel] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    slug: string;
    title: string;
    isCustom: boolean;
  } | null>(null);
  const [removePin, setRemovePin] = useState('');

  if (!profile) return null;

  const customSlugs = new Set(customChannels.map((c) => c.slug));

  const onChannelAdded = () => {
    setShowAddChannel(false);
    loadDiscoverFeed(true, visibleChannels);
  };

  const finishRemove = async (target: { slug: string; isCustom: boolean }) => {
    const nextChannels = visibleChannels.filter((c) => c.slug !== target.slug);
    if (target.isCustom) {
      removeCustomChannel(target.slug);
    } else {
      hideChannel(profile.id, target.slug);
    }
    await AsyncStorage.removeItem('calmdowntube-channel-feed-cache').catch(() => undefined);
    loadDiscoverFeed(true, nextChannels);
    setRemoveTarget(null);
    setRemovePin('');
  };

  if (removeTarget) {
    return (
      <Screen title="Remover canal" subtitle={removeTarget.title} onBack={() => setRemoveTarget(null)}>
        <PinPad
          value={removePin}
          onChange={(v) => {
            setRemovePin(v);
            if (v.length === 4) {
              setTimeout(() => {
                if (!verifyPin(v)) {
                  Alert.alert('PIN incorreto');
                  setRemovePin('');
                  return;
                }
                finishRemove(removeTarget);
              }, 0);
            }
          }}
          title="PIN dos pais"
          subtitle="Confirme para remover este canal deste perfil"
        />
      </Screen>
    );
  }

  return (
    <Screen
      title="Canais e playlists"
      subtitle="Listas fixas + canais que os pais adicionam"
      headerRight={
        <Pressable onPress={() => router.replace('/')} hitSlop={8}>
          <Text style={styles.switchBtn}>Trocar</Text>
        </Pressable>
      }
    >
      {showAddChannel ? (
        <AddChannelForm
          onAdded={onChannelAdded}
          onCancel={() => setShowAddChannel(false)}
        />
      ) : (
        <Pressable
          style={({ pressed }) => [styles.addCard, pressed && styles.cardPressed]}
          onPress={() => setShowAddChannel(true)}
        >
          <Text style={styles.addEmoji}>➕</Text>
          <View style={styles.addText}>
            <Text style={styles.cardTitle}>Adicionar canal</Text>
            <Text style={styles.cardDesc}>
              Digite o nome do canal (PIN dos pais) — novos vídeos entram no Início
            </Text>
          </View>
        </Pressable>
      )}

      {visibleChannels.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📡 Canais</Text>
          <View style={styles.grid}>
            {visibleChannels.map((channel) => (
              <View key={channel.slug} style={styles.customCardWrap}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/channel/[slug]',
                      params: { slug: channel.slug },
                    })
                  }
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                  <Text style={styles.cardEmoji}>📡</Text>
                  <Text style={styles.cardTitle}>{channel.title}</Text>
                  <Text style={styles.cardDesc}>
                    {customSlugs.has(channel.slug)
                      ? 'Canal adicionado pelos pais'
                      : 'Canal oficial · vídeos recentes'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    setRemoveTarget({
                      slug: channel.slug,
                      title: channel.title,
                      isCustom: customSlugs.has(channel.slug),
                    })
                  }
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>Remover</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {SEARCH_ENABLED && (
        <Pressable
          style={({ pressed }) => [styles.searchCard, pressed && styles.cardPressed]}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.searchEmoji}>🔍</Text>
          <View style={styles.searchText}>
            <Text style={styles.cardTitle}>Buscar vídeos</Text>
            <Text style={styles.cardDesc}>
              Com filtros de segurança — sem shorts nem termos inadequados
            </Text>
          </View>
        </Pressable>
      )}

      {categories.map((category) => {
        const categoryPlaylists = playlists.filter((p) =>
          category.playlistIds.includes(p.id),
        );
        if (categoryPlaylists.length === 0) return null;

        return (
          <View key={category.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {category.emoji} {category.title}
            </Text>
            <View style={styles.grid}>
              {categoryPlaylists.map((playlist) => (
                <Pressable
                  key={playlist.id}
                  onPress={() =>
                    router.push({
                      pathname: '/playlist/[id]',
                      params: { id: playlist.id },
                    })
                  }
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                  <Text style={styles.cardEmoji}>{playlist.emoji}</Text>
                  <Text style={styles.cardTitle}>{playlist.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {playlist.description}
                  </Text>
                  <Text style={styles.cardCount}>
                    {playlist.videoIds.length}{' '}
                    {playlist.videoIds.length === 1 ? 'vídeo' : 'vídeos'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchBtn: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  grid: {
    gap: spacing.md,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  addEmoji: {
    fontSize: 28,
  },
  addText: {
    flex: 1,
    gap: spacing.xs,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  searchEmoji: {
    fontSize: 28,
  },
  searchText: {
    flex: 1,
    gap: spacing.xs,
  },
  customCardWrap: {
    gap: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  cardCount: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  removeBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  removeBtnText: {
    color: colors.danger,
    fontSize: 13,
  },
});
