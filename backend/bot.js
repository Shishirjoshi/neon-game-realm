/**
 * BOT PLAYER SYSTEM FOR TEEN PATTI
 * Manages AI bot players with difficulty levels and strategic decision making
 */

const { evaluateHand, getHandStrength, compareHands } = require('./gameLogic');

/**
 * DIFFICULTY LEVELS
 */
const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

/**
 * TEEN PATTI BOT CLASS
 */
class TeenPattiBot {
  constructor(id, name, difficulty = DIFFICULTY.MEDIUM, seat = 0) {
    this.id = id;
    this.name = name;
    this.difficulty = difficulty;
    this.seat = seat;
    this.coins = 1000;
    this.hand = [];
    this.folded = false;
    this.currentBet = 0;
    this.isPlaying = true;
  }

  /**
   * SET HAND FOR BOT
   */
  setHand(cards) {
    this.hand = cards;
  }

  /**
   * EVALUATE HAND STRENGTH (0-1)
   */
  evaluateHandStrength() {
    if (!this.hand || this.hand.length !== 3) return 0;

    const evaluation = evaluateHand(this.hand);
    const strengthMap = {
      'trio': 0.95,
      'sequence': 0.75,
      'color': 0.70,
      'pair': 0.50,
      'high-card': 0.30,
      'invalid': 0.0,
    };

    return strengthMap[evaluation.type] || 0;
  }

  /**
   * CALCULATE POT ODDS
   */
  calculatePotOdds(pot, currentBet) {
    if (currentBet === 0) return Infinity;
    return pot / currentBet;
  }

  /**
   * DECIDE ACTION - EASY BOT (random, conservative)
   */
  decideActionEasy(pot, currentBet, activePlayers) {
    const handStrength = this.evaluateHandStrength();
    const rand = Math.random();

    // Very likely to fold
    if (rand < 0.65) {
      return { action: 'fold', amount: 0 };
    }

    // Sometimes call
    if (rand < 0.90) {
      return { action: 'call', amount: currentBet };
    }

    // Rarely raise
    const raiseAmount = Math.min(currentBet * (1 + Math.random()), this.coins);
    return { action: 'raise', amount: raiseAmount };
  }

  /**
   * DECIDE ACTION - MEDIUM BOT (balanced, uses hand strength)
   */
  decideActionMedium(pot, currentBet, activePlayers, minBet) {
    const handStrength = this.evaluateHandStrength();
    const potOdds = this.calculatePotOdds(pot, currentBet);

    // Strong hand (high card or better)
    if (handStrength > 0.7) {
      if (Math.random() < 0.3) {
        const raiseAmount = Math.min(minBet * 2 + Math.random() * minBet, this.coins);
        return { action: 'raise', amount: raiseAmount };
      }
      return { action: 'call', amount: currentBet };
    }

    // Medium hand (pair)
    if (handStrength > 0.45) {
      // Check pot odds
      if (potOdds > 2) {
        return { action: 'call', amount: currentBet };
      }
      // Occasional bluff
      if (Math.random() < 0.3) {
        return { action: 'call', amount: currentBet };
      }
      return { action: 'fold', amount: 0 };
    }

    // Weak hand
    if (currentBet > minBet) {
      return { action: 'fold', amount: 0 };
    }

    // Cheap call available
    if (Math.random() < 0.2) {
      return { action: 'call', amount: currentBet };
    }

    return { action: 'fold', amount: 0 };
  }

  /**
   * DECIDE ACTION - HARD BOT (strategic, aggressive)
   */
  decideActionHard(pot, currentBet, activePlayers, minBet) {
    const handStrength = this.evaluateHandStrength();
    const potOdds = this.calculatePotOdds(pot, currentBet);
    const playerCount = activePlayers.length;

    // Very strong hand (sequence or trio)
    if (handStrength > 0.75) {
      // Aggressive raise in large pots
      if (pot > minBet * 5) {
        const aggressiveRaise = Math.min(pot * 0.5, this.coins);
        return { action: 'raise', amount: aggressiveRaise };
      }
      // Standard raise
      const raiseAmount = Math.min(minBet * 3, this.coins);
      return { action: 'raise', amount: raiseAmount };
    }

    // Good hand (color or pair)
    if (handStrength > 0.50) {
      // Position awareness: heads-up play is more aggressive
      if (playerCount <= 2 && handStrength > 0.50) {
        const raiseAmount = Math.min(minBet * 2, this.coins);
        return { action: 'raise', amount: raiseAmount };
      }

      // Check pot odds
      if (potOdds > 2) {
        return { action: 'call', amount: currentBet };
      }

      // Poor odds with decent hand
      if (currentBet > minBet) {
        return { action: 'fold', amount: 0 };
      }
      return { action: 'call', amount: currentBet };
    }

    // Weak hand
    if (currentBet > minBet) {
      return { action: 'fold', amount: 0 };
    }

    // Extremely cheap or free call
    if (Math.random() < 0.15) {
      return { action: 'call', amount: currentBet };
    }

    return { action: 'fold', amount: 0 };
  }

  /**
   * MAKE DECISION
   */
  decideAction(pot, currentBet, activePlayers, minBet = 50) {
    if (this.folded || !this.isPlaying) {
      return { action: 'fold', amount: 0 };
    }

    switch (this.difficulty) {
      case DIFFICULTY.EASY:
        return this.decideActionEasy(pot, currentBet, activePlayers);
      case DIFFICULTY.MEDIUM:
        return this.decideActionMedium(pot, currentBet, activePlayers, minBet);
      case DIFFICULTY.HARD:
        return this.decideActionHard(pot, currentBet, activePlayers, minBet);
      default:
        return this.decideActionMedium(pot, currentBet, activePlayers, minBet);
    }
  }

  /**
   * GET THINKING DELAY (milliseconds)
   */
  getThinkingDelay() {
    switch (this.difficulty) {
      case DIFFICULTY.EASY:
        return 300 + Math.random() * 700; // 300-1000ms
      case DIFFICULTY.MEDIUM:
        return 500 + Math.random() * 1000; // 500-1500ms
      case DIFFICULTY.HARD:
        return 800 + Math.random() * 1200; // 800-2000ms
      default:
        return 500 + Math.random() * 1000;
    }
  }

  /**
   * RESET FOR NEW ROUND
   */
  reset() {
    this.hand = [];
    this.folded = false;
    this.currentBet = 0;
    this.isPlaying = true;
  }

  /**
   * FOLD
   */
  fold() {
    this.folded = true;
    this.isPlaying = false;
  }

  /**
   * UPDATE COINS
   */
  updateCoins(amount) {
    this.coins = Math.max(0, this.coins + amount);
  }

  /**
   * GET BOT STATUS
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      difficulty: this.difficulty,
      seat: this.seat,
      coins: this.coins,
      folded: this.folded,
      handStrength: this.evaluateHandStrength(),
      isPlaying: this.isPlaying,
    };
  }
}

/**
 * BOT MANAGER
 */
class BotManager {
  constructor() {
    this.bots = new Map();
  }

  /**
   * CREATE AND ADD BOT
   */
  createBot(id, name, difficulty = DIFFICULTY.MEDIUM, seat = 0) {
    const bot = new TeenPattiBot(id, name, difficulty, seat);
    this.bots.set(id, bot);
    return bot;
  }

  /**
   * GET BOT
   */
  getBot(id) {
    return this.bots.get(id);
  }

  /**
   * GET ALL BOTS
   */
  getBots() {
    return Array.from(this.bots.values());
  }

  /**
   * REMOVE BOT
   */
  removeBot(id) {
    this.bots.delete(id);
  }

  /**
   * CLEAR ALL BOTS
   */
  clear() {
    this.bots.clear();
  }
}

/**
 * CREATE BOTS WITH NAMES
 */
function createBots(count = 2, difficulty = DIFFICULTY.MEDIUM) {
  const botNames = [
    'Ace Hunter',
    'Royal Flush',
    'Bluff Master',
    'Card Sharp',
    'High Roller',
    'Fortune Seeker',
    'Pot Collector',
    'Quick Draw',
  ];

  const bots = [];
  for (let i = 0; i < count; i++) {
    const name = botNames[i % botNames.length];
    bots.push({
      id: `bot-${i}-${Date.now()}`,
      name: `${name} ${i + 1}`,
      difficulty,
      seat: i + 1,
    });
  }

  return bots;
}

module.exports = {
  TeenPattiBot,
  BotManager,
  createBots,
  DIFFICULTY,
};
