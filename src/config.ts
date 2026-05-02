/**
 * Environment Configuration
 * Centralizes all environment variable access with defaults
 */

export const config = {
  // Application
  appName: import.meta.env.VITE_APP_NAME || "Gamehub",
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || "Premium browser gaming",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Socket.IO
  socketUrl: import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",

  // Chess Configuration
  chess: {
    difficultyDefault: (import.meta.env.VITE_CHESS_DIFFICULTY_DEFAULT as any) || "medium",
    botThinkTimeMin: parseInt(import.meta.env.VITE_CHESS_BOT_THINK_TIME_MIN || "500"),
    botThinkTimeMax: parseInt(import.meta.env.VITE_CHESS_BOT_THINK_TIME_MAX || "1500"),
    enableCastling: import.meta.env.VITE_CHESS_ENABLE_CASTLING !== "false",
    enableEnPassant: import.meta.env.VITE_CHESS_ENABLE_EN_PASSANT === "true",
  },

  // Feature Flags
  features: {
    multiplayer: import.meta.env.VITE_ENABLE_MULTIPLAYER !== "false",
    offlineGames: import.meta.env.VITE_ENABLE_OFFLINE_GAMES !== "false",
    statsTracking: import.meta.env.VITE_ENABLE_STATS_TRACKING !== "false",
    leaderboard: import.meta.env.VITE_ENABLE_LEADERBOARD !== "false",
  },

  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    isConfigured:
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  },

  // Analytics
  analytics: {
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED === "true",
    id: import.meta.env.VITE_ANALYTICS_ID || "",
  },

  // URLs
  urls: {
    deploy: import.meta.env.VITE_DEPLOY_URL || "http://localhost:8081",
    api: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  },

  // Logging
  logLevel:
    (import.meta.env.VITE_LOG_LEVEL as any) || (import.meta.env.DEV ? "debug" : "info"),
};

/**
 * Validate critical configuration
 */
export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!config.supabase.isConfigured && !import.meta.env.DEV) {
    errors.push("Supabase configuration missing in production");
  }

  if (!config.socketUrl && config.features.multiplayer) {
    errors.push("Socket.IO URL not configured for multiplayer");
  }

  return errors;
}

/**
 * Log configuration (safe, excludes secrets)
 */
export function logConfig(): void {
  console.log(
    "%c⚙️ Gamehub Configuration",
    "font-weight: bold; color: #0ff;",
    {
      app: config.appName,
      environment: config.isDevelopment ? "development" : "production",
      features: config.features,
      chess: config.chess,
    }
  );
}
