import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileCard } from '@/components/ProfileCard';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useStoreHydration } from '@/hooks/useStoreHydration';
import { useAppStore } from '@/store/useAppStore';

export default function HomeScreen() {
  const hydrated = useStoreHydration();
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const parentPin = useAppStore((s) => s.parentPin);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);

  useEffect(() => {
    if (!hydrated) return;
    if (!parentPin) {
      router.replace('/parent/setup-pin');
    }
  }, [hydrated, parentPin]);

  const onSelectProfile = (id: string) => {
    setActiveProfile(id);
    router.push('/browse');
  };

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <Screen
      title="CalmDownTube"
      subtitle="Quem vai assistir? Calmo, seguro e divertido."
      scroll={false}
      headerRight={
        <Link href="/parent/pin" asChild>
          <Pressable style={styles.parentBtn}>
            <Text style={styles.parentBtnText}>Pais</Text>
          </Pressable>
        </Link>
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.profileRow}
      >
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            selected={profile.id === activeProfileId}
            onPress={() => onSelectProfile(profile.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.hint}>
        <Text style={styles.hintText}>
          Sem feed infinito — só playlists e canais aprovados.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileRow: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  parentBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  parentBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: 'auto',
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
