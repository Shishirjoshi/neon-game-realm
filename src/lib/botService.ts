import type { GamePlayer } from '@/contexts/GameContext';

export interface BotPlayer extends GamePlayer {
  isBot: true;
}

export function createBotPlayers(count: number, startSeat: number = 0): BotPlayer[] {
  const botNames = [
    'Nova',
    'Cipher',
    'Phoenix',
    'Sentinel',
    'Vortex',
    'Echo',
    'Blaze',
    'Nexus',
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
  }));
}

// Bot decision making for Teen Patti
export function getBotAction(
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): 'fold' | 'call' | 'raise' {
  const rand = Math.random();

  switch (difficulty) {
    case 'easy':
      if (rand < 0.6) return 'fold';
      if (rand < 0.9) return 'call';
      return 'raise';

    case 'medium':
      if (rand < 0.4) return 'fold';
      if (rand < 0.7) return 'call';
      return 'raise';

    case 'hard':
      if (rand < 0.2) return 'fold';
      if (rand < 0.5) return 'call';
      return 'raise';
  }
}

export function getBotRaiseAmount(
  minBet: number,
  pot: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): number {
  const baseRaise = minBet * 2;

  switch (difficulty) {
    case 'easy':
      return baseRaise + Math.random() * minBet * 2;

    case 'medium':
      return baseRaise + Math.random() * minBet * 3;

    case 'hard':
      // More aggressive raises for hard bots
      return baseRaise + pot * 0.3 + Math.random() * minBet * 2;
  }
}

// Bot typing speed simulation
export function getBotTypingSpeed(
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
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

// Simulate bot typing progress
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
