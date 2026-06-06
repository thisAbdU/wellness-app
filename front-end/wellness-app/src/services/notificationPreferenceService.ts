import { apiGet, apiPut, unwrap } from '@/lib/api/client';
import type { ApiResponse, NotificationPreferences } from '@/lib/api/types';

const PREFERENCES_PATH = '/api/v1/notifications/preferences';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  challenge_updates: true,
  badge_alerts: true,
  coach_insights: true,
  emergency_alerts: true,
  leaderboard_updates: false,
  daily_reminders: true,
};

export function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  return apiGet<ApiResponse<NotificationPreferences>>(PREFERENCES_PATH).then(unwrap);
}

export function saveNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  return apiPut<ApiResponse<NotificationPreferences>>(PREFERENCES_PATH, preferences).then(unwrap);
}
