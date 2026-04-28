import type { GamePlayer } from '@/contexts/GameContext';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface BotPlayer extends GamePlayer {
  isBot: true;
  difficulty?: BotDifficulty;
}

/**
 * Create bot players with specified difficulty
 */
export function createBotPlayers(
  count: number,
  startSeat: number = 0,
  difficulty: BotDifficulty = 'medium'
): BotPlayer[] {
  const botNames = [
    'Nova',
    'Cipher',
    'Phoenix',
    'Sentinel',
    'Vortex',
    'Echo',
    'Blaze',
    'Nexus',
    'Rogue',
    'Storm',
    'Prism',
    'Wraith',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `bot-${Date.now()}-${i}`,
    username: botNames[i % botNames.length],
    avatar_url: null,
    seat: startSeat + i,
    isReady: true,
    coinBalance: 1000,
    status: 'playing' as const,
    isBot: true,
    difficulty,
  }));
}

/**
 * Get bot difficulty display name
 */
export function getDifficultyLabel(difficulty: BotDifficulty): string {
  const labels: Record<BotDifficulty, string> = {
    easy: '🟢 Easy (Loose)',
    medium: '🟡 Medium (Balanced)',
    hard: '🔴 Hard (Smart)',
  };
  return labels[difficulty];
}

/**
 * Get bot difficulty description
 */
export function getDifficultyDescription(difficulty: BotDifficulty): string {
  const descriptions: Record<BotDifficulty, string> = {
    easy: 'Makes risky plays and folds often. Great for beginners.',
    medium: 'Balanced strategy. Moderate risk-taking.',
    hard: 'Evaluates hand strength and plays optimally. Challenging opponent.',
  };
  return descriptions[difficulty];
}

// Bot typing speed simulation
export function getBotTypingSpeed(
  difficulty: BotDifficulty = 'medium'
): { wpm: number; accuracy: number } {
  switch (difficulty) {
    case 'easy':
      return {
        wpm: 40 + Math.random() * 20,
        accuracy: 85 + Math.random() * 10,
      };

    case 'medium':
      return {
        wpm: 60 + Math.random() * 20,
        accuracy: 90 + Math.random() * 8,
      };

    case 'hard':
      return {
        wpm: 80 + Math.random() * 20,
        accuracy: 94 + Math.random() * 5,
      };
  }
}

/**
 * Simulate bot typing progress
 */
export function simulateBotTypingProgress(
  textLength: number,
  gamePhase: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): number {
  if (gamePhase !== 'active') return 0;

  const speed = getBotTypingSpeed(difficulty);
  // Simulate progress based on WPM and time elapsed
  const avgCharsPerSecond = (speed.wpm * 5) / 60;
  const elapsedSeconds = Math.random() * 30; // Assume up to 30 seconds elapsed

  return Math.min(1, (avgCharsPerSecond * elapsedSeconds) / textLength);
}
