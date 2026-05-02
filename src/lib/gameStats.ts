/**
 * Game Stats Tracking Hook
 * Tracks wins, losses, and performance metrics
 */

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  longestWinStreak: number;
  currentWinStreak: number;
  bestGameTime: number; // milliseconds
  averageGameTime: number;
  totalGameTime: number;
  lastPlayedAt: string;
}

const STATS_KEY = "chess_game_stats";
const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  bestGameTime: Infinity,
  averageGameTime: 0,
  totalGameTime: 0,
  lastPlayedAt: new Date().toISOString(),
};

export function loadStats(): GameStats {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    return stored ? JSON.parse(stored) : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    console.warn("Failed to save game stats");
  }
}

export function recordGameResult(
  result: "win" | "loss" | "draw",
  gameDurationMs: number
): GameStats {
  const stats = loadStats();

  stats.gamesPlayed += 1;
  stats.totalGameTime += gameDurationMs;
  stats.averageGameTime = stats.totalGameTime / stats.gamesPlayed;
  stats.bestGameTime = Math.min(stats.bestGameTime, gameDurationMs);
  stats.lastPlayedAt = new Date().toISOString();

  if (result === "win") {
    stats.wins += 1;
    stats.currentWinStreak += 1;
    stats.longestWinStreak = Math.max(stats.longestWinStreak, stats.currentWinStreak);
  } else if (result === "loss") {
    stats.losses += 1;
    stats.currentWinStreak = 0;
  } else if (result === "draw") {
    stats.draws += 1;
    stats.currentWinStreak = 0;
  }

  saveStats(stats);
  return stats;
}

export function getWinRate(stats: GameStats): number {
  if (stats.gamesPlayed === 0) return 0;
  return (stats.wins / stats.gamesPlayed) * 100;
}

export function clearStats(): void {
  localStorage.removeItem(STATS_KEY);
}
