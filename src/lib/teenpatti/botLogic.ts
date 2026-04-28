/**
 * TEEN PATTI - BOT DECISION LOGIC
 * Difficulty-based strategies: Easy, Medium, Hard
 * Enhanced with probability-based analysis and pot odds calculation
 */

import { Card, getHandStrength, getWinProbability, evaluateHand } from './handEvaluator';

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
 * Calculate pot odds to determine call value
 * Returns true if expected value of calling is positive
 */
function shouldCallBasedOnOdds(
  currentBet: number,
  pot: number,
  winProbability: number
): boolean {
  if (currentBet === 0) return true; // Free call

  const potOdds = currentBet / (pot + currentBet);
  return winProbability > potOdds;
}

/**
 * Calculate appropriate bet sizing based on hand strength
 */
function calculateBetSize(
  handStrength: 'high' | 'medium' | 'low',
  winProbability: number,
  minBet: number,
  maxAvailable: number,
  context: GameContext
): number {
  if (handStrength === 'high') {
    // Strong hand: bet 30-60% of current potential
    const percentage = 0.3 + winProbability * 0.3;
    return Math.min(minBet * 2 + context.pot * percentage, maxAvailable);
  }

  if (handStrength === 'medium') {
    // Medium hand: bet 20-40% of min bet
    const percentage = 0.2 + winProbability * 0.2;
    return Math.min(minBet * (1 + percentage), maxAvailable);
  }

  // Weak hand: minimal bet if attempting bluff
  return Math.min(minBet * 0.5, maxAvailable);
}

/**
 * Determine bluff frequency based on situation
 */
function getBluffFrequency(
  winProbability: number,
  playersRemaining: number,
  round: number
): number {
  // Weaker hand, fewer opponents, later rounds = more bluffing
  const bluffChance = (1 - winProbability) * (1 / playersRemaining) * (1 + round * 0.1);
  return Math.min(bluffChance, 0.4); // Cap at 40%
}

/**
 * EASY BOT LOGIC
 * Random, with slight bias towards folding
 * Strategy: Loose and timid - uses minimal analysis
 */
function easyBotDecision(
  hand: Card[],
  context: GameContext,
  playerCoins: number
): BotDecision {
  const rand = Math.random();
  const handStrength = getHandStrength(hand);

  // Very likely to fold
  if (rand < 0.65) {
    return {
      action: 'fold',
      amount: 0,
      confidence: 0.4,
      reasoning: `Easy bot: Conservative fold (${handStrength} hand)`,
    };
  }

  // Sometimes call
  if (rand < 0.90) {
    return {
      action: 'call',
      amount: context.currentBet,
      confidence: 0.5,
      reasoning: `Easy bot: Casual call (${handStrength} hand)`,
    };
  }

  // Rarely raise (risky, doesn't consider hand strength)
  const raiseAmount = context.minBet * (1 + Math.random());
  return {
    action: 'raise',
    amount: Math.min(raiseAmount, playerCoins),
    confidence: 0.3,
    reasoning: 'Easy bot: Lucky raise (random aggression)',
  };
}

/**
 * MEDIUM BOT LOGIC
 * Balanced approach using probability and hand strength
 * Strategy: Moderate risk-taking with basic pot odds awareness
 */
function mediumBotDecision(
  hand: Card[],
  context: GameContext,
  playerCoins: number
): BotDecision {
  const handStrength = getHandStrength(hand);
  const winProb = getWinProbability(hand);
  const evaluation = evaluateHand(hand);

  // Strong hand (high probability to win)
  if (handStrength === 'high') {
    // Check if we should raise aggressively
    if (winProb > 0.7) {
      // Raise more when pot is growing
      const potMultiplier = Math.min(context.pot / context.minBet, 5) * 0.2;
      const raiseAmount = context.minBet * (1.5 + potMultiplier);

      return {
        action: 'raise',
        amount: Math.min(raiseAmount, playerCoins),
        confidence: 0.75 + winProb * 0.15,
        reasoning: `Medium bot: Strong hand (${evaluation.type}, ${(winProb * 100).toFixed(0)}% win prob) - raising`,
      };
    }

    // Otherwise call with strong hand
    return {
      action: 'call',
      amount: context.currentBet,
      confidence: winProb,
      reasoning: `Medium bot: Strong hand (${evaluation.type}) - calling`,
    };
  }

  // Medium hand (moderate probability)
  if (handStrength === 'medium') {
    // Use pot odds to decide if call makes sense
    if (shouldCallBasedOnOdds(context.currentBet, context.pot, winProb)) {
      // If pot odds favor us, call or raise
      if (Math.random() < 0.3 && winProb > 0.45) {
        const raiseAmount = context.minBet * (1 + Math.random());
        return {
          action: 'raise',
          amount: Math.min(raiseAmount, playerCoins),
          confidence: 0.55 + winProb * 0.1,
          reasoning: `Medium bot: Medium hand (${(winProb * 100).toFixed(0)}% win prob) - semi-bluff raise`,
        };
      }

      // Call the current bet
      return {
        action: 'call',
        amount: context.currentBet,
        confidence: winProb,
        reasoning: `Medium bot: Medium hand (${(winProb * 100).toFixed(0)}% win prob) - pot odds favorable`,
      };
    }

    // Pot odds don't favor calling
    return {
      action: 'fold',
      amount: 0,
      confidence: 1 - winProb,
      reasoning: `Medium bot: Medium hand (${(winProb * 100).toFixed(0)}% win prob) - poor pot odds`,
    };
  }

  // Weak hand (low probability)
  if (context.currentBet <= context.minBet) {
    // Cheap option available - consider bluffing occasionally
    if (Math.random() < getBluffFrequency(winProb, context.playersRemaining, context.round)) {
      return {
        action: 'call',
        amount: context.currentBet,
        confidence: 0.3,
        reasoning: `Medium bot: Weak hand - attempting semi-bluff (${(winProb * 100).toFixed(0)}% win prob)`,
      };
    }
  }

  // Weak hand, expensive bet - fold
  return {
    action: 'fold',
    amount: 0,
    confidence: 1 - winProb,
    reasoning: `Medium bot: Weak hand (${(winProb * 100).toFixed(0)}% win prob) - folding`,
  };
}

/**
 * HARD BOT LOGIC
 * Aggressive, strategic, uses full probability analysis
 * Strategy: Optimal play with calculated risk-reward decisions
 */
function hardBotDecision(
  hand: Card[],
  context: GameContext,
  playerCoins: number
): BotDecision {
  const handStrength = getHandStrength(hand);
  const winProb = getWinProbability(hand);
  const evaluation = evaluateHand(hand);

  // Calculate expected value
  const potOddsPercentage = context.currentBet / (context.pot + context.currentBet);
  const expectedValue = winProb - potOddsPercentage;

  // VERY STRONG HAND (Trio - 95% win probability)
  if (evaluation.type === 'trio') {
    // Aggressive betting to extract value
    if (context.pot > context.minBet * 3) {
      // Large pot: build it more
      const aggressiveRaise = Math.min(context.pot * 0.75, playerCoins);
      return {
        action: 'raise',
        amount: aggressiveRaise,
        confidence: 0.95,
        reasoning: `Hard bot: Trio (95% win) - aggressive value extraction`,
      };
    }

    // Smaller pot: still raise to build
    return {
      action: 'raise',
      amount: Math.min(context.minBet * 4, playerCoins),
      confidence: 0.95,
      reasoning: `Hard bot: Trio (95% win) - building pot`,
    };
  }

  // STRONG HAND (Sequence/Color - 70-85% win probability)
  if ((evaluation.type === 'sequence' || evaluation.type === 'color') && winProb > 0.65) {
    // Raise with strong probability
    if (context.playersRemaining <= 2) {
      // Heads-up: more aggressive
      const headsUpRaise = Math.min(context.pot * 0.5, playerCoins);
      return {
        action: 'raise',
        amount: headsUpRaise,
        confidence: winProb,
        reasoning: `Hard bot: Strong hand in heads-up (${(winProb * 100).toFixed(0)}% win) - aggressive`,
      };
    }

    // Multiple opponents: controlled aggression
    const valueRaise = Math.min(context.minBet * (2 + context.pot * 0.1), playerCoins);
    return {
      action: 'raise',
      amount: valueRaise,
      confidence: winProb,
      reasoning: `Hard bot: Strong hand (${evaluation.type}, ${(winProb * 100).toFixed(0)}% win) - value raise`,
    };
  }

  // GOOD HAND (Pair - 45-55% win probability)
  if (evaluation.type === 'pair' && winProb > 0.45) {
    // Position matters here
    if (context.playersRemaining <= 2) {
      // Heads-up with decent hand: pressure
      const pairRaise = Math.min(context.minBet * 2.5, playerCoins);
      return {
        action: 'raise',
        amount: pairRaise,
        confidence: 0.65,
        reasoning: `Hard bot: Pair in heads-up (${(winProb * 100).toFixed(0)}% win) - position play`,
      };
    }

    // Multiple opponents: be cautious
    if (shouldCallBasedOnOdds(context.currentBet, context.pot, winProb)) {
      return {
        action: 'call',
        amount: context.currentBet,
        confidence: winProb,
        reasoning: `Hard bot: Pair (${(winProb * 100).toFixed(0)}% win) - pot odds positive`,
      };
    }

    return {
      action: 'fold',
      amount: 0,
      confidence: 1 - winProb,
      reasoning: `Hard bot: Pair (${(winProb * 100).toFixed(0)}% win) - pot odds unfavorable`,
    };
  }

  // MEDIUM HAND (High Card or weak Pair - 30-45% win probability)
  if (winProb > 0.35) {
    // Use pot odds strictly
    if (shouldCallBasedOnOdds(context.currentBet, context.pot, winProb)) {
      // Odds are favorable - call or semi-bluff raise occasionally
      if (context.playersRemaining <= 2 && winProb > 0.4 && Math.random() < 0.25) {
        return {
          action: 'raise',
          amount: Math.min(context.minBet * 1.5, playerCoins),
          confidence: 0.45,
          reasoning: `Hard bot: Medium hand (${(winProb * 100).toFixed(0)}% win) - semi-bluff in position`,
        };
      }

      return {
        action: 'call',
        amount: context.currentBet,
        confidence: winProb,
        reasoning: `Hard bot: Medium hand (${(winProb * 100).toFixed(0)}% win) - pot odds call`,
      };
    }

    // Odds unfavorable - fold
    return {
      action: 'fold',
      amount: 0,
      confidence: 1 - winProb,
      reasoning: `Hard bot: Medium hand (${(winProb * 100).toFixed(0)}% win) - negative EV`,
    };
  }

  // WEAK HAND (Low card - less than 30% win probability)
  // Only play if extremely favorable odds or can bluff
  if (context.currentBet <= context.minBet * 0.5) {
    // Extremely cheap to call - play occasionally
    if (Math.random() < getBluffFrequency(winProb, context.playersRemaining, context.round)) {
      return {
        action: 'call',
        amount: context.currentBet,
        confidence: 0.25,
        reasoning: `Hard bot: Weak hand - exploitation call (${(winProb * 100).toFixed(0)}% win)`,
      };
    }
  }

  // Weak hand - fold
  return {
    action: 'fold',
    amount: 0,
    confidence: 1 - winProb,
    reasoning: `Hard bot: Weak hand (${(winProb * 100).toFixed(0)}% win) - folding for value`,
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
