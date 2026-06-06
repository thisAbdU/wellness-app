import { api } from '@/lib/api';
import type { Challenge } from '@/lib/api/types';
import { supabase } from '@/lib/supabase';

export type ChallengeTemplate = {
  id: string;
  title?: string;
  title_am?: string;
  description?: string;
  metric?: string;
  target_value?: number;
  duration_days?: number;
};

export type ChallengeDashboard = {
  active: Challenge[];
  completed: Challenge[];
  available: ChallengeTemplate[];
};

function challengeId(challenge: Challenge): string {
  return String(challenge.challenge_id ?? challenge.id ?? '');
}

export async function fetchChallengeTemplates(): Promise<ChallengeTemplate[]> {
  const { data, error } = await supabase
    .from('challenge_templates')
    .select('*')
    .eq('is_active', true)
    .order('title');

  if (error) throw error;
  return (data ?? []) as ChallengeTemplate[];
}

export async function fetchChallengeDashboard(): Promise<ChallengeDashboard> {
  const [activeResult, historyResult, templateResult] = await Promise.allSettled([
    api.challenges.active(),
    api.challenges.me(),
    fetchChallengeTemplates(),
  ]);

  if (activeResult.status === 'rejected') throw activeResult.reason;

  const active = activeResult.value;
  const history = historyResult.status === 'fulfilled' ? historyResult.value : [];
  const templates = templateResult.status === 'fulfilled' ? templateResult.value : [];
  const activeIds = new Set(active.map(challengeId));

  return {
    active,
    completed: history.filter((challenge) => challenge.status === 'completed'),
    available: templates.filter((template) => !activeIds.has(String(template.id))),
  };
}

export function startChallenge(templateId: string): Promise<Challenge> {
  return api.challenges.start(templateId);
}

export function fetchChallengeProgress(challengeId: string): Promise<Challenge> {
  return api.challenges.progress(challengeId);
}

export function getChallengeId(challenge: Challenge, fallback = ''): string {
  return challengeId(challenge) || fallback;
}

export function getChallengeProgress(challenge: Challenge) {
  const current = challenge.progress_json?.qualifying_days ?? challenge.progress ?? 0;
  const required = challenge.progress_json?.required_days ?? challenge.duration_days ?? 1;
  return {
    current,
    required,
    ratio: required > 0 ? Math.min(current / required, 1) : 0,
  };
}
