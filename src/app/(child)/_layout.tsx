import { Tabs, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { lockPortrait } from '@/utils/screenOrientation';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{emoji}</Text>;
}

export default function ChildTabsLayout() {
  const profile = useAppStore((s) => s.getActiveProfile());

  useEffect(() => {
    if (!profile) {
      router.replace('/');
    }
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      lockPortrait();
    }, []),
  );

  if (!profile) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Canais',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📺" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          href: null,
          title: 'Assistir',
        }}
      />
      <Tabs.Screen
        name="channel/[slug]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="playlist/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.65,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
