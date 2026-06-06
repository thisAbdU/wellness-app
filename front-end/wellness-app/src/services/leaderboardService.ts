import { api } from '@/lib/api';
import type { LeaderboardEntry } from '@/lib/api/types';

export type LeaderboardScope = 'national' | 'city';
export type LeaderboardMetric = 'wellness_score' | 'steps' | 'streak';

export type LeaderboardQuery = {
  scope: LeaderboardScope;
  metric: LeaderboardMetric;
  city?: string;
};

export async function fetchLeaderboard({
  scope,
  metric,
  city,
}: LeaderboardQuery): Promise<LeaderboardEntry[]> {
  const cityValue = city?.trim();
  if (scope === 'city' && !cityValue) {
    throw new Error('Enter a city to view city rankings.');
  }

  return api.leaderboards.get(scope, scope === 'city' ? cityValue : undefined, metric);
}

export function formatLeaderboardValue(value: number, metric: LeaderboardMetric): string {
  const rounded = Math.round(value);
  if (metric === 'wellness_score') return `${rounded} pts`;
  if (metric === 'steps') return `${rounded.toLocaleString()} steps`;
  return `${rounded} days`;
}
