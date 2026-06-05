import { supabase } from '@/lib/supabase';
import type { EmergencyContact, UserProfile } from '@/lib/api/types';

export type ProfileSetupData = {
  fullName: string;
  age: number;
  gender: string;
  city: string;
  heightCm: number;
  weightKg: number;
  fitnessGoal: string;
  preferredLanguage: 'en' | 'am';
  allergies?: string[];
  dislikedFoods?: string[];
  orthodoxFasting?: boolean;
  neighborhood?: string;
  university?: string;
  company?: string;
  region?: string;
};

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  return Boolean(profile?.full_name && profile?.city);
}

export async function upsertProfile(
  userId: string,
  data: Partial<ProfileSetupData & UserProfile>,
): Promise<UserProfile> {
  const healthConditions: string[] = [];
  if (data.allergies?.length) healthConditions.push(...data.allergies.map((a) => `allergy:${a}`));
  if (data.dislikedFoods?.length) {
    healthConditions.push(...data.dislikedFoods.map((f) => `dislike:${f}`));
  }
  if (data.orthodoxFasting) healthConditions.push('orthodox_fasting');

  const record = {
    user_id: userId,
    full_name: data.fullName ?? data.full_name,
    age: data.age,
    gender: data.gender,
    city: data.city,
    region: data.region,
    height_cm: data.heightCm ?? data.height_cm,
    weight_kg: data.weightKg ?? data.weight_kg,
    fitness_goal: data.fitnessGoal ?? data.fitness_goal,
    preferred_language: data.preferredLanguage ?? data.preferred_language ?? 'en',
    neighborhood: data.neighborhood,
    university: data.university,
    company: data.company,
    health_conditions: healthConditions.length ? healthConditions : undefined,
    notification_prefs: data.notification_prefs,
    fcm_token: data.fcm_token,
  };

  const { data: saved, error } = await supabase
    .from('profiles')
    .upsert(record, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return saved;
}

export async function saveEmergencyContact(
  userId: string,
  contact: { name: string; phone: string; relationship?: string },
): Promise<void> {
  const { error } = await supabase.from('emergency_contacts').upsert(
    {
      user_id: userId,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship ?? 'Family',
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
}

export async function fetchEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function fetchFoods(): Promise<import('@/lib/api/types').Food[]> {
  const { data, error } = await supabase.from('foods').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map((f) => ({
    ...f,
    meal_type: Array.isArray(f.meal_type) ? f.meal_type : [],
  }));
}

export async function fetchChallengeTemplates(): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from('challenge_templates')
    .select('*')
    .eq('is_active', true)
    .order('title');
  if (error) throw error;
  return data ?? [];
}

export async function fetchAiInsights(userId: string): Promise<import('@/lib/api/types').AiInsight[]> {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('id, insight_type, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function saveAiInsight(
  userId: string,
  insightType: string,
  content: string,
): Promise<void> {
  const { error } = await supabase.from('ai_insights').insert({
    user_id: userId,
    insight_type: insightType,
    content,
  });
  if (error) throw error;
}
