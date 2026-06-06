export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AuthUser = {
  id: string;
  email?: string;
};

export type UserProfile = {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  country?: string;
  region?: string;
  city?: string;
  university?: string;
  company?: string;
  neighborhood?: string;
  preferred_language?: string;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  gender?: string;
  fitness_goal?: string;
  activity_level?: string;
  health_conditions?: string[] | string;
  fcm_token?: string;
  notification_prefs?: Record<string, boolean>;
};

export type WellnessScore = {
  activity_score: number;
  sleep_score: number;
  recovery_score: number;
  consistency_score: number;
  total_score: number;
};

export type HealthSyncPayload = {
  summary_date: string;
  steps: number;
  calories_burned: number;
  active_minutes: number;
  sleep_minutes: number;
  sleep_quality_score?: number;
  resting_heart_rate?: number | null;
  workout_count: number;
  data_source?: string;
};

export type HealthSyncResult = {
  health_summary: Record<string, unknown>;
  wellness_score: WellnessScore;
  streaks: Record<string, unknown>;
  awarded_badges: unknown[];
  challenges: unknown;
};

export type WeeklyAnalytics = {
  days: string[];
  steps: number[];
  sleep_minutes: number[];
  active_minutes: number[];
  calories_burned: number[];
  wellness_scores: number[];
  average_steps: number;
  average_sleep_minutes: number;
  average_wellness_score: number;
};

export type MonthlyAnalytics = {
  start_date: string;
  end_date: string;
  average_steps: number;
  average_sleep_minutes: number;
  average_active_minutes: number;
  average_wellness_score: number;
  total_workouts: number;
  best_wellness_day: string | null;
  worst_wellness_day: string | null;
  improvement_percentage: number;
};

export type Streak = {
  streak_type: string;
  current_count: number;
  longest_count: number;
  last_completed_date?: string;
};

export type Badge = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  earned_at?: string;
};

export type Challenge = {
  id?: string;
  challenge_id?: string;
  title?: string;
  title_am?: string;
  description?: string;
  metric?: string;
  target_value?: number;
  duration_days?: number;
  status?: string;
  progress?: number;
  progress_json?: {
    qualifying_days?: number;
    required_days?: number;
    log?: Record<string, boolean>;
  };
  started_at?: string;
  start_date?: string;
  completed_at?: string;
};

export type LeaderboardEntry = {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  city?: string;
  metric: string;
  value: number;
  rank: number;
};

export type NutritionPlan = {
  targets: { calories_min: number; calories_max: number; tdee: number };
  plan: string;
  food_pool_size: number;
};

export type CoachInsight = {
  insight_type: string;
  insight: string;
};

export type VoiceCoachResult = {
  transcript: string;
  response_text: string;
  audio_url: string | null;
  language: string;
  tts_available: boolean;
};

export type Food = {
  id: string;
  name: string;
  name_am?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: string[];
  category?: string;
};

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  relationship: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
};

export type NotificationPreferences = {
  challenge_updates: boolean;
  badge_alerts: boolean;
  coach_insights: boolean;
  emergency_alerts: boolean;
  leaderboard_updates: boolean;
  daily_reminders: boolean;
};

export type AiInsight = {
  id: string;
  insight_type: string;
  content: string;
  created_at: string;
};
