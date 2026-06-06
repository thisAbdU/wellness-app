import { api } from '@/lib/api';
import type { CoachInsight } from '@/lib/api/types';

export type CoachInsightType = 'daily' | 'weekly' | 'recovery' | 'burnout' | 'behavioral';

const INSIGHT_TYPES: Record<CoachInsightType, string> = {
  daily: 'DAILY_NUDGE',
  weekly: 'WEEKLY_SUMMARY',
  recovery: 'RECOVERY_ADVICE',
  burnout: 'BURNOUT_WARNING',
  behavioral: 'BEHAVIORAL_PATTERN',
};

export const COACH_FALLBACK_MESSAGE =
  'Keep building your wellness routine today. A short walk, enough water, and consistent sleep all count.';

export function fetchCoachInsight(insightType: CoachInsightType = 'daily'): Promise<CoachInsight> {
  return api.coach.insight(INSIGHT_TYPES[insightType]);
}
