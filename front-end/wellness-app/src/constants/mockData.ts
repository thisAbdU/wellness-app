export const MOCK_USER = {
  name: 'Abel Tadesse',
  city: 'Addis Ababa',
  age: 28,
  gender: 'Male',
  weightKg: 72,
  heightCm: 175,
  goal: 'General Wellness',
  rank: 142,
  wellnessScore: 82,
  streak: 12,
  wellnessStreak: 8,
};

export const MOCK_CHALLENGES_ACTIVE = [
  {
    id: '1',
    title: '10K Steps Daily',
    duration: '14 days',
    metric: 'Steps',
    progress: 0.57,
    icon: '👟',
  },
];

export const MOCK_CHALLENGES_AVAILABLE = [
  {
    id: '2',
    title: 'Sleep 7+ Hours',
    duration: '7 days',
    metric: 'Sleep',
    icon: '🌙',
  },
  {
    id: '3',
    title: 'Hydration Hero',
    duration: '10 days',
    metric: 'Water',
    icon: '💧',
  },
];

export const MOCK_MEALS = [
  {
    id: 'b',
    type: 'Breakfast',
    nameEn: 'Injera with Shiro',
    nameAm: 'የሽሮ ወጥ እንጀራ',
    calories: 420,
    protein: 18,
    carbs: 62,
    fat: 12,
  },
  {
    id: 'l',
    type: 'Lunch',
    nameEn: 'Tibs with Greens',
    nameAm: 'ጥብስ ከአትክልት',
    calories: 580,
    protein: 35,
    carbs: 28,
    fat: 32,
  },
  {
    id: 'd',
    type: 'Dinner',
    nameEn: 'Chickpea Wat',
    nameAm: 'ሽምብራ ወጥ',
    calories: 380,
    protein: 16,
    carbs: 48,
    fat: 10,
  },
];

export const MOCK_LEADERBOARD = [
  { id: '1', name: 'Hanna M.', score: 94, streak: 21, rank: 1 },
  { id: '2', name: 'Dawit K.', score: 91, streak: 18, rank: 2 },
  { id: '3', name: 'Sara T.', score: 89, streak: 15, rank: 3 },
  { id: '4', name: 'Yonas B.', score: 85, streak: 12, rank: 4 },
];

export const MOCK_DEVICES = [
  { id: 'hc', name: 'Google Health Connect', connected: true, lastSync: '2 min ago' },
  { id: 'garmin', name: 'Garmin', connected: false, lastSync: '—' },
  { id: 'fitbit', name: 'Fitbit', connected: false, lastSync: '—' },
  { id: 'xiaomi', name: 'Xiaomi', connected: false, lastSync: '—' },
  { id: 'samsung', name: 'Samsung Health', connected: false, lastSync: '—' },
];

export const MOCK_WORKOUTS = [
  {
    id: 'w1',
    type: 'Morning Run',
    duration: '32 min',
    calories: 280,
    source: 'Garmin',
    hrZones: true,
    hasMap: true,
  },
];

export const WEEKLY_STEPS = [6200, 8100, 8432, 7200, 9100, 6800, 8432];
