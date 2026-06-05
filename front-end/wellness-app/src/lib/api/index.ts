import { apiGet, apiPost, unwrap } from './client';
import type {
  ApiResponse,
  AuthUser,
  Badge,
  Challenge,
  CoachInsight,
  EmergencyContact,
  Food,
  HealthSyncPayload,
  HealthSyncResult,
  LeaderboardEntry,
  MonthlyAnalytics,
  NutritionPlan,
  Streak,
  VoiceCoachResult,
  WeeklyAnalytics,
  WellnessScore,
} from './types';

export const api = {
  auth: {
    me: () => apiGet<ApiResponse<AuthUser>>('/auth/me').then(unwrap),
  },

  health: {
    sync: (payload: HealthSyncPayload) =>
      apiPost<ApiResponse<HealthSyncResult>>('/health/sync', payload).then(unwrap),
    daily: (summaryDate: string) =>
      apiGet<ApiResponse<Record<string, unknown>>>(
        `/health/daily?summary_date=${encodeURIComponent(summaryDate)}`,
      ).then(unwrap),
  },

  analytics: {
    weekly: () =>
      apiGet<ApiResponse<WeeklyAnalytics>>('/analytics/weekly').then(unwrap),
    monthly: () =>
      apiGet<ApiResponse<MonthlyAnalytics>>('/analytics/monthly').then(unwrap),
  },

  streaks: {
    me: () => apiGet<ApiResponse<Streak[]>>('/streaks/me').then(unwrap),
  },

  badges: {
    all: () => apiGet<ApiResponse<Badge[]>>('/badges').then(unwrap),
    me: () => apiGet<ApiResponse<Badge[]>>('/badges/me').then(unwrap),
  },

  challenges: {
    list: () => apiGet<ApiResponse<Challenge[]>>('/challenges').then(unwrap),
    me: () => apiGet<ApiResponse<Challenge[]>>('/challenges/me').then(unwrap),
    join: (challengeId: string) =>
      apiPost<ApiResponse<Challenge>>(`/challenges/${challengeId}/join`).then(unwrap),
    active: () =>
      apiGet<ApiResponse<Challenge[]>>('/api/v1/challenges/active').then(unwrap),
    start: (templateId: string) =>
      apiPost<ApiResponse<Challenge>>('/api/v1/challenges/start', {
        template_id: templateId,
      }).then(unwrap),
    progress: (challengeId: string) =>
      apiGet<ApiResponse<Challenge>>(`/api/v1/challenges/${challengeId}/progress`).then(unwrap),
  },

  leaderboards: {
    get: (scope = 'national', value?: string, metric = 'wellness_score') => {
      const params = new URLSearchParams({ scope, metric });
      if (value) params.set('value', value);
      return apiGet<ApiResponse<LeaderboardEntry[]>>(`/leaderboards?${params}`).then(unwrap);
    },
  },

  coach: {
    insight: (insightType: string) =>
      apiPost<ApiResponse<CoachInsight>>('/api/v1/coach/insight', {
        insight_type: insightType,
      }).then(unwrap),
    weeklySummary: () =>
      apiGet<ApiResponse<Record<string, unknown>>>('/api/v1/coach/weekly-summary').then(unwrap),
    patterns: () =>
      apiGet<ApiResponse<unknown[]>>('/api/v1/coach/patterns').then(unwrap),
    voice: (audioUri: string, language?: string) => {
      const form = new FormData();
      form.append('audio', {
        uri: audioUri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      } as unknown as Blob);
      if (language) form.append('language', language);
      return apiPost<ApiResponse<VoiceCoachResult>>('/api/v1/coach/voice', form).then(unwrap);
    },
  },

  nutrition: {
    dailyPlan: (language?: string) => {
      const q = language ? `?language=${language}` : '';
      return apiGet<ApiResponse<NutritionPlan>>(`/api/v1/nutrition/daily-plan${q}`).then(unwrap);
    },
  },

  emergency: {
    notify: (gpsLat?: number, gpsLng?: number) =>
      apiPost<ApiResponse<{ queued: number }>>('/api/v1/emergency/notify', {
        gps_lat: gpsLat ?? null,
        gps_lng: gpsLng ?? null,
      }).then(unwrap),
  },

  sync: {
    push: (records: unknown[]) =>
      apiPost<ApiResponse<unknown>>('/api/v1/sync/push', { records }).then(unwrap),
    pull: (since?: string) => {
      const q = since ? `?since=${encodeURIComponent(since)}` : '';
      return apiGet<ApiResponse<unknown>>(`/api/v1/sync/pull${q}`).then(unwrap);
    },
  },
};

export type { WellnessScore };
