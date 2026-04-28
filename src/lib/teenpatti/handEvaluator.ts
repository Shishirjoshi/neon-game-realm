/**
 * TEEN PATTI - HAND EVALUATION & RANKING
 * Evaluate hand strength for AI decision-making
 */

export interface Card {
  rank: string;
  suit: string;
}

export type HandStrength = 'high' | 'medium' | 'low';
export type HandType =
  | 'trio'
  | 'sequence'
  | 'color'
  | 'pair'
  | 'high-card'
  | 'invalid';

export interface HandEvaluation {
  type: HandType;
  strength: HandStrength;
  rank: number;
  highCard: number;
  description: string;
}

/**
 * Get numeric value for card rank
 */
const getRankValue = (rank: string): number => {
  const values: Record<string, number> = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14,
  };
  return values[rank] || 0;
};

/**
 * Check if three ranks form a sequence (straight)
 */
const isSequence = (ranks: number[]): boolean => {
  const sorted = [...ranks].sort((a, b) => b - a);
  // Check consecutive (e.g., 5, 4, 3)
  if (
    sorted[0] - sorted[1] === 1 &&
    sorted[1] - sorted[2] === 1
  ) {
    return true;
  }
  // Check for A-K-Q (14-13-12)
  if (sorted[0] === 14 && sorted[1] === 13 && sorted[2] === 12) {
    return true;
  }
  // Check for A-2-3 (14-2-3 wraps)
  if (sorted.includes(14) && sorted.includes(3) && sorted.includes(2)) {
    return true;
  }
  return false;
};

/**
 * Evaluate a 3-card hand (Teen Patti)
 */
export function evaluateHand(hand: Card[]): HandEvaluation {
  // Validate hand
  if (!hand || hand.length !== 3) {
    return {
      type: 'invalid',
      strength: 'low',
      rank: 0,
      highCard: 0,
      description: 'Invalid hand',
    };
  }

  const ranks = hand.map((c) => getRankValue(c.rank)).sort((a, b) => b - a);
  const suits = hand.map((c) => c.suit);

  // Count rank frequencies
  const rankCounts: Record<number, number> = {};
  ranks.forEach((r) => {
    rankCounts[r] = (rankCounts[r] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const uniqueRanks = Object.keys(rankCounts)
    .map(Number)
    .sort((a, b) => b - a);

  // 1. TRIO (Three of a kind) - HIGHEST
  if (counts[0] === 3) {
    return {
      type: 'trio',
      strength: 'high',
      rank: 8,
      highCard: ranks[0],
      description: `Trio of ${hand[0].rank}s`,
    };
  }

  // 2. PURE SEQUENCE (Straight with same suit)
  const allSameSuit = suits[0] === suits[1] && suits[1] === suits[2];
  if (allSameSuit && isSequence(ranks)) {
    return {
      type: 'sequence',
      strength: 'high',
      rank: 7,
      highCard: ranks[0],
      description: `Pure Sequence (${hand.map((c) => c.rank).join('-')})`,
    };
  }

  // 3. SEQUENCE (Straight, different suits)
  if (isSequence(ranks)) {
    return {
      type: 'sequence',
      strength: 'high',
      rank: 6,
      highCard: ranks[0],
      description: `Sequence (${hand.map((c) => c.rank).join('-')})`,
    };
  }

  // 4. COLOR (Flush - all same suit)
  if (allSameSuit) {
    return {
      type: 'color',
      strength: 'medium',
      rank: 5,
      highCard: ranks[0],
      description: `Color (all ${suits[0]}s)`,
    };
  }

  // 5. PAIR (Two cards with same rank)
  if (counts[0] === 2) {
    return {
      type: 'pair',
      strength: 'medium',
      rank: 4,
      highCard: uniqueRanks[0], // Pair rank
      description: `Pair of ${hand[0].rank}s`,
    };
  }

  // 6. HIGH CARD (No combinations)
  return {
    type: 'high-card',
    strength: 'low',
    rank: 3,
    highCard: ranks[0],
    description: `High card ${hand[0].rank}`,
  };
}

/**
 * Compare two hands and return winner
 * Returns: 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
export function compareHands(hand1: Card[], hand2: Card[]): number {
  const eval1 = evaluateHand(hand1);
  const eval2 = evaluateHand(hand2);

  // Compare by hand type rank
  if (eval1.rank !== eval2.rank) {
    return eval1.rank > eval2.rank ? 1 : -1;
  }

  // Same type - compare high cards
  if (eval1.highCard !== eval2.highCard) {
    return eval1.highCard > eval2.highCard ? 1 : -1;
  }

  // Identical hands
  return 0;
}

/**
 * Get hand strength for decision-making
 * Simplified version for quick evaluation
 */
export function getHandStrength(hand: Card[]): HandStrength {
  const eval = evaluateHand(hand);
  if (eval.strength === 'high') return 'high';
  if (eval.strength === 'medium') return 'medium';
  return 'low';
}

/**
 * Get win probability estimate (0-1) for hand strength
 */
export function getWinProbability(hand: Card[]): number {
  const eval = evaluateHand(hand);

  switch (eval.type) {
    case 'trio':
      return 0.95; // Almost guaranteed
    case 'sequence':
      return eval.rank === 7 ? 0.85 : 0.75; // Pure vs mixed
    case 'color':
      return 0.70;
    case 'pair':
      return eval.highCard >= 11 ? 0.55 : 0.45; // High pair vs low pair
    case 'high-card':
      return eval.highCard >= 12 ? 0.40 : 0.30; // Ace/King vs low
    default:
      return 0.25;
  }
}
