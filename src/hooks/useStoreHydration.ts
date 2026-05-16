import { useEffect, useState } from 'react';

import { useAppStore } from '@/store/useAppStore';

/** Wait for AsyncStorage rehydration before reading persisted state. */
export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    const timeout = setTimeout(() => setHydrated(true), 1500);

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  return hydrated;
}
