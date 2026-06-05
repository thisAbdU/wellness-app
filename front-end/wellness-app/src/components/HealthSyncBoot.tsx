import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthConnect } from '@/hooks/useHealthConnect';
import { syncHealthFromDevice } from '@/services/healthSyncService';

/** Syncs Health Connect data to backend when user is authenticated. */
export function HealthSyncBoot() {
  const { isAuthenticated } = useAuth();
  const { hasAnyData, data, status } = useHealthConnect();

  useEffect(() => {
    if (!isAuthenticated || status !== 'connected' || !hasAnyData) return;
    syncHealthFromDevice(data).catch((e) =>
      console.warn('[HealthSync] failed', e),
    );
  }, [isAuthenticated, hasAnyData, status, data]);

  return null;
}
