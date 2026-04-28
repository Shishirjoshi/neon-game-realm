/**
 * TEEN PATTI - BOT DECISION LOGIC
 * Difficulty-based strategies: Easy, Medium, Hard
 */

import { Card, getHandStrength, getWinProbability } from './handEvaluator';

export type BotDifficulty = 'easy' | 'medium' | 'hard';
export type BotAction = 'fold' | 'call' | 'raise' | 'check';

export interface BotDecision {
  action: BotAction;
  amount: number;
  confidence: number;
  reasoning: string;
}

export interface GameContext {
  currentBet: number;
  minBet: number;
  pot: number;
  playersRemaining: number;
  round: number;
}

/**
 * EASY BOT LOGIC
 * Random, with slight bias towards folding
 * Strategy: Loose and timid
 */
function easyBotDecision(
  hand: Card[],
  context: GameContext,
  playerCoins: number
): BotDecision {
  const rand = Math.random();

  // Very likely to fold
  if (rand < 0.65) {
    return {
      action: 'fold',
      amount: 0,
      confidence: 0.4,
      reasoning: 'Easy bot: Conservative fold',
    };
  }

  // Sometimes call
  if (rand < 0.90) {
    return {
      action: 'call',
      amount: context.currentBet,
      confidence: 0.5,
      reasoning: 'Easy bot: Casual call',
    };
  }

  // Rarely raise (risky)
  const raiseAmount = context.minBet * (1 + Math.random());
  return {
    action: 'raise',
    amount: Math.min(raiseAmount, playerCoins),
    confidence: 0.3,
    reasoning: 'Easy bot: Lucky raise',
  };
}

/**
 * MEDIUM BOT LOGIC
 * Balanced approach, considers hand strength slightly
 * Strategy: Moderate risk-taking
 */
function mediumBotDecision(
  hand: Card[],
  context: GameContext,
  playerCoins: number
): BotDecision {
  const handStrength = getHandStrength(hand);
  const winProb = getWinProbability(hand);

  // Strong hand
  if (handStrength === 'high') {
    const rand = Math.random();
    // More likely to raise with strong hand
    if (rand < 0.3) {
      const raiseAmount = context.minBet * (2 + Math.random());
      return {
        action: 'raise',
        amount: Math.min(raiseAmount, playerCoins),
        confidence: 0.75,
        reasoning: 'Medium bot: Strong hand raise',
      };
    }
    // Otherwise call
    return {
      action: 'call',
      amount: context.currentBet,
      confidence: 0.7,
      reasoning: 'Medium bot: Strong hand call',
    };
  }

  // Medium hand
  if (handStrength === 'medium') {
    const rand = Math.random();
    // Balanced: fold, call, raise
    if (rand < 0.4) {
      return {
        action: 'fold',
        amount: 0,
        confidence: 0.55,
        reasoning: 'Medium bot: Medium hand fold',
      };
    }
    if (rand < 0.8) {
      return {
        action: 'call',
        amount: context.currentBet,
        confidence: 0.55,
        reasoning: 'Medium bot: Medium hand call',
      };
    }
    const raiseAmount = context.minBet * (1 + Math.random());
    return {
      action: 'raise',
      amount: Math.min(raiseAmount, playerCoins),
      confidence: 0.4,
      reasoning: 'Medium bot: Medium hand bluff raise',
    };
  }

  // Weak hand
  const rand = Math.random();
  if (rand < 0.6) {
    return {
      action: 'fold',
      amount: 0,
      confidence: 0.6,
      reasoning: 'Medium bot: Weak hand fold',
    };
  }
  return {
    action: 'call',
    amount: context.currentBet,
    confidence: 0.35,
    reasoning: 'Medium bot: Weak hand call (gamble)',
  };
}

/**
 * HARD BOT LOGIC
 * Aggressive, strategic, hand strength aware
 * Strategy: Optimal play with some randomness
 */
function hardBotDecision(
  hand: Card[],
  context: GameContext,
  playerCoins: number
): BotDecision {
  const handStrength = getHandStrength(hand);
  const winProb = getWinProbability(hand);

  // Strong hand - AGGRESSIVE
  if (handStrength === 'high') {
    // If pot already significant, raise aggressively
    if (context.pot > context.minBet * 5) {
      const potRaise = Math.min(context.pot * 0.5, playerCoins);
      return {
        action: 'raise',
        amount: potRaise,
        confidence: 0.85,
        reasoning: 'Hard bot: Strong hand aggressive raise',
      };
    }

    // Pot still small, but still raise to build it
    const raiseAmount = context.minBet * (3 + Math.random() * 2);
    return {
      action: 'raise',
      amount: Math.min(raiseAmount, playerCoins),
      confidence: 0.8,
      reasoning: 'Hard bot: Strong hand building pot',
    };
  }

  // Medium hand - CONDITIONAL
  if (handStrength === 'medium') {
    // Check position/opponents
    if (context.playersRemaining <= 2) {
      // Heads-up or 1v1 near end - more aggressive
      if (winProb > 0.5) {
        const raiseAmount = context.minBet * 2;
        return {
          action: 'raise',
          amount: Math.min(raiseAmount, playerCoins),
          confidence: 0.65,
          reasoning: 'Hard bot: Medium hand heads-up raise',
        };
      }
    }

    // Multiple opponents - be careful
    if (context.currentBet <= context.minBet) {
      return {
        action: 'call',
        amount: context.currentBet,
        confidence: 0.55,
        reasoning: 'Hard bot: Medium hand cheap call',
      };
    }

    // Current bet is high - fold
    return {
      action: 'fold',
      amount: 0,
      confidence: 0.6,
      reasoning: 'Hard bot: Medium hand fold vs aggression',
    };
  }

  // Weak hand - STRATEGIC FOLDING
  if (context.currentBet > context.minBet) {
    return {
      action: 'fold',
      amount: 0,
      confidence: 0.75,
      reasoning: 'Hard bot: Weak hand fold',
    };
  }

  // Weak hand but cheap call available - occasional bluff
  if (Math.random() < 0.2) {
    return {
      action: 'call',
      amount: context.currentBet,
      confidence: 0.3,
      reasoning: 'Hard bot: Weak hand bluff call',
    };
  }

  return {
    action: 'fold',
    amount: 0,
    confidence: 0.8,
    reasoning: 'Hard bot: Weak hand fold (smart)',
  };
}

/**
 * Get bot decision based on difficulty
 */
export function getBotDecision(
  difficulty: BotDifficulty,
  hand: Card[],
  context: GameContext,
  playerCoins: number
): BotDecision {
  // Ensure valid inputs
  const safeContext = {
    currentBet: Math.max(0, context.currentBet),
    minBet: Math.max(1, context.minBet),
    pot: Math.max(0, context.pot),
    playersRemaining: Math.max(1, context.playersRemaining),
    round: Math.max(0, context.round),
  };

  switch (difficulty) {
    case 'easy':
      return easyBotDecision(hand, safeContext, playerCoins);
    case 'medium':
      return mediumBotDecision(hand, safeContext, playerCoins);
    case 'hard':
      return hardBotDecision(hand, safeContext, playerCoins);
    default:
      return mediumBotDecision(hand, safeContext, playerCoins);
  }
}

/**
 * Get delay in milliseconds for bot to "think"
 * Creates realistic pause before action
 */
export function getBotThinkDelay(difficulty: BotDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 300 + Math.random() * 700; // 300-1000ms
    case 'medium':
      return 500 + Math.random() * 1000; // 500-1500ms
    case 'hard':
      return 800 + Math.random() * 1200; // 800-2000ms (takes longer to "think")
    default:
      return 500 + Math.random() * 1000;
  }
}
