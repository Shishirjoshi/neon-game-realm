import { useState, useEffect } from "react";

export interface UserPreferences {
  chessLanguage: string;
  chessDifficulty: "easy" | "medium" | "hard";
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: "dark" | "light";
  showHints: boolean;
  autoSave: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  chessLanguage: "en",
  chessDifficulty: "medium",
  soundEnabled: true,
  animationsEnabled: true,
  theme: "dark",
  showHints: true,
  autoSave: true,
};

const PREFERENCES_KEY = "user_preferences";

/**
 * Load user preferences from localStorage
 */
export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : { ...DEFAULT_PREFERENCES };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = loadPreferences();
  const updated = { ...current, ...prefs };
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch {
    console.warn("Failed to save user preferences");
  }
  return updated;
}

/**
 * React hook for managing user preferences
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    loadPreferences()
  );

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    savePreferences(updated);
  };

  const updateMultiple = (prefs: Partial<UserPreferences>) => {
    const updated = savePreferences(prefs);
    setPreferences(updated);
  };

  const resetToDefaults = () => {
    setPreferences({ ...DEFAULT_PREFERENCES });
    localStorage.removeItem(PREFERENCES_KEY);
  };

  return {
    preferences,
    updatePreference,
    updateMultiple,
    resetToDefaults,
  };
}

/**
 * Export default preferences for fallback
 */
export { DEFAULT_PREFERENCES };
