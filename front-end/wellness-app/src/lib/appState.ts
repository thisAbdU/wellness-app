/** In-memory bootstrap flags — replace with SecureStore + Supabase session later. */
export const appState = {
  hasSeenOnboarding: false,
  isAuthenticated: false,
  hasCompletedProfileSetup: false,
};

export function markAuthenticated() {
  appState.isAuthenticated = true;
}

export function completeOnboarding() {
  appState.hasSeenOnboarding = true;
}

export function completeProfileSetup() {
  appState.hasCompletedProfileSetup = true;
}

export function signOut() {
  appState.isAuthenticated = false;
  appState.hasCompletedProfileSetup = false;
}

export function getInitialRoute(): string {
  if (!appState.hasSeenOnboarding) return '/(auth)/onboarding';
  if (!appState.isAuthenticated) return '/(auth)/sign-in';
  if (!appState.hasCompletedProfileSetup) return '/(auth)/profile-setup/step-1';
  return '/(app)/(tabs)/home';
}
