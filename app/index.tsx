import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileCard } from '@/components/ProfileCard';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function HomeScreen() {
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const hasPin = useAppStore((s) => s.hasPin);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);

  useEffect(() => {
    if (!hasPin()) {
      router.replace('/parent/setup-pin');
    }
  }, [hasPin]);

  const onSelectProfile = (id: string) => {
    setActiveProfile(id);
    router.push('/browse');
  };

  return (
    <Screen
      title="CalmDownTube"
      subtitle="Choose who's watching. Calm, safe, and fun."
      scroll={false}
      headerRight={
        <Link href="/parent/pin" asChild>
          <Pressable style={styles.parentBtn}>
            <Text style={styles.parentBtnText}>Parents</Text>
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
          No endless feed — only approved playlists and channels.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
