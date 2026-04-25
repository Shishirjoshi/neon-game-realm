/**
 * TEEN PATTI GAME LOGIC
 * Core game mechanics, hand ranking, and winner calculation
 */

/**
 * CREATE DECK
 * Returns a standard 52-card deck
 */
const createDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];

  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ rank, suit });
    }
  }

  return deck;
};

/**
 * SHUFFLE DECK (Fisher-Yates Algorithm)
 */
const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * DEAL CARDS
 * Deals 3 cards to each player
 */
const dealCards = (players) => {
  const deck = shuffleDeck(createDeck());
  let cardIndex = 0;

  players.forEach((player) => {
    player.hand = [deck[cardIndex++], deck[cardIndex++], deck[cardIndex++]];
  });

  return players;
};

/**
 * CARD RANK VALUE
 * Returns numeric value for rank comparison
 */
const getRankValue = (rank) => {
  const rankValues = {
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
  return rankValues[rank] || 0;
};

/**
 * CHECK HAND TYPE
 * Evaluates the type of hand and returns hand info
 */
const evaluateHand = (hand) => {
  if (!hand || hand.length !== 3) {
    return { type: 'invalid', rank: 0, description: 'Invalid hand' };
  }

  const ranks = hand.map((card) => getRankValue(card.rank)).sort((a, b) => b - a);
  const suits = hand.map((card) => card.suit);
  const rankCounts = {};

  ranks.forEach((r) => {
    rankCounts[r] = (rankCounts[r] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  // 1. TRIO (Three of a kind)
  if (counts[0] === 3) {
    return {
      type: 'trio',
      rank: 5,
      highCard: ranks[0],
      description: `Trio of ${hand[0].rank}s`,
    };
  }

  // 2. SEQUENCE (Straight)
  const isSequence = ranks[0] - ranks[1] === 1 && ranks[1] - ranks[2] === 1;
  const isWheelSequence = ranks[0] === 14 && ranks[1] === 3 && ranks[2] === 2; // A-3-2

  if (isSequence || isWheelSequence) {
    return {
      type: 'sequence',
      rank: 4,
      highCard: isWheelSequence ? 5 : ranks[0],
      description: 'Sequence',
    };
  }

  // 3. COLOR (Flush - all same suit)
  if (suits[0] === suits[1] && suits[1] === suits[2]) {
    return {
      type: 'color',
      rank: 3,
      highCard: ranks[0],
      description: 'Color',
    };
  }

  // 4. PAIR
  if (counts[0] === 2) {
    return {
      type: 'pair',
      rank: 2,
      highCard: Object.keys(rankCounts).find((k) => rankCounts[k] === 2),
      secondHighCard: ranks[2],
      description: `Pair of ${hand[0].rank}s`,
    };
  }

  // 5. HIGH CARD
  return {
    type: 'highcard',
    rank: 1,
    highCard: ranks[0],
    secondHighCard: ranks[1],
    thirdHighCard: ranks[2],
    description: 'High Card',
  };
};

/**
 * COMPARE HANDS
 * Returns 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
const compareHands = (hand1, hand2) => {
  const eval1 = evaluateHand(hand1);
  const eval2 = evaluateHand(hand2);

  // Compare hand ranks (higher is better)
  if (eval1.rank > eval2.rank) return 1;
  if (eval1.rank < eval2.rank) return -1;

  // Same hand type, compare high cards
  if (eval1.highCard > eval2.highCard) return 1;
  if (eval1.highCard < eval2.highCard) return -1;

  // Compare second high card (for pairs and high cards)
  if (eval1.secondHighCard && eval2.secondHighCard) {
    if (eval1.secondHighCard > eval2.secondHighCard) return 1;
    if (eval1.secondHighCard < eval2.secondHighCard) return -1;
  }

  // Compare third high card
  if (eval1.thirdHighCard && eval2.thirdHighCard) {
    if (eval1.thirdHighCard > eval2.thirdHighCard) return 1;
    if (eval1.thirdHighCard < eval2.thirdHighCard) return -1;
  }

  return 0; // Tie
};

/**
 * DETERMINE WINNER
 * Compares all active players' hands and returns winner
 */
const determineWinner = (players) => {
  const activePlayers = players.filter((p) => !p.folded && p.hand && p.hand.length === 3);

  if (activePlayers.length === 0) {
    return null;
  }

  if (activePlayers.length === 1) {
    return activePlayers[0];
  }

  // Compare hands
  let winner = activePlayers[0];
  for (let i = 1; i < activePlayers.length; i++) {
    const result = compareHands(winner.hand, activePlayers[i].hand);
    if (result < 0) {
      winner = activePlayers[i];
    }
  }

  return winner;
};

/**
 * GET NEXT ACTIVE PLAYER
 * Returns next player who hasn't folded
 */
const getNextActivePlayer = (players, currentIndex) => {
  let nextIndex = (currentIndex + 1) % players.length;
  let attempts = 0;

  while (attempts < players.length) {
    if (!players[nextIndex].folded) {
      return nextIndex;
    }
    nextIndex = (nextIndex + 1) % players.length;
    attempts++;
  }

  return -1; // No active players
};

/**
 * FORMAT CURRENCY
 * Returns formatted currency string
 */
const formatCurrency = (amount) => `₨${amount?.toLocaleString('en-IN') || 0}`;

module.exports = {
  createDeck,
  shuffleDeck,
  dealCards,
  evaluateHand,
  compareHands,
  determineWinner,
  getNextActivePlayer,
  getRankValue,
  formatCurrency,
};
