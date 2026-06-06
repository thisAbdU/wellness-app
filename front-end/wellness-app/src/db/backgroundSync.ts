import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { flushSyncQueue, pullAiFeedbacks } from './syncQueue';

type SyncConfig = {
  userId: string;
};

let netUnsubscribe:   (() => void) | null = null;
let stateUnsubscribe: (() => void) | null = null; // AppState returns a subscription too
let isSyncing = false; // guard against concurrent flushes

// ── core flush with concurrency guard ────────────────────────────────────────
async function runSync(userId: string) {
  if (isSyncing) return;
  isSyncing = true;
  try {
    await flushSyncQueue();
    await pullAiFeedbacks(userId);
  } catch (e) {
    console.warn('[BackgroundSync] sync failed', e);
  } finally {
    isSyncing = false;
  }
}

// ── start listeners ───────────────────────────────────────────────────────────
export function startBackgroundSync(config: SyncConfig) {
  const { userId } = config;

  // 1. Connectivity restore  fires when network comes back
  netUnsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    if (state.isConnected && state.isInternetReachable) {
      runSync(userId);
    }
  });

  // 2. App foreground  fires when user returns to app
  const appStateSub = AppState.addEventListener(
    'change',
    (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        runSync(userId);
      }
    },
  );
  // AppState returns a subscription object, not a function
  stateUnsubscribe = () => appStateSub.remove();

  // 3. Immediate flush on start (in case there's a queue from last session)
  runSync(userId);
}

// ── stop listeners (call on logout / unmount) ─────────────────────────────────
export function stopBackgroundSync() {
  netUnsubscribe?.();
  stateUnsubscribe?.();
  netUnsubscribe   = null;
  stateUnsubscribe = null;
  isSyncing        = false;
}