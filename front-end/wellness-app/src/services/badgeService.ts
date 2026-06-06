import { api } from '@/lib/api';
import type { Badge } from '@/lib/api/types';

export type BadgeWithState = Badge & {
  earned: boolean;
};

export async function fetchBadgesWithState(): Promise<BadgeWithState[]> {
  const [allBadges, earnedBadges] = await Promise.all([
    api.badges.all(),
    api.badges.me(),
  ]);
  const earnedById = new Map(earnedBadges.map((badge) => [String(badge.id), badge]));

  return allBadges.map((badge) => {
    const earnedBadge = earnedById.get(String(badge.id));
    return {
      ...badge,
      ...earnedBadge,
      earned: Boolean(earnedBadge),
    };
  });
}

export function formatEarnedDate(earnedAt?: string): string | null {
  if (!earnedAt) return null;
  const date = new Date(earnedAt);
  if (Number.isNaN(date.getTime())) return earnedAt;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
