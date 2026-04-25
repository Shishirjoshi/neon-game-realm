/**
 * BOT AI SERVICE
 * Handles bot decision making for Teen Patti offline mode
 */

const { evaluateHand, compareHands, getRankValue } = require('./gameLogic');

/**
 * BOT DIFFICULTY LEVELS
 */
const DIFFICULTY = {
  EASY: 'easy',       // Folds often, bets randomly
  MEDIUM: 'medium',   // Balanced play
  HARD: 'hard',       // Aggressive, analyzes hands
};

/**
 * BOT PERSONALITY
 */
const PERSONALITIES = {
  AGGRESSIVE: 'aggressive',    // Bets frequently
  CAUTIOUS: 'cautious',        // Folds easily
  BALANCED: 'balanced',        // Mixed strategy
};

/**
 * BOT CLASS
 */
class Bot {
  constructor(id, name, difficulty = DIFFICULTY.MEDIUM, personality = PERSONALITIES.BALANCED) {
    this.id = id;
    this.name = name;
    this.difficulty = difficulty;
    this.personality = personality;
    this.coins = 1000;
    this.hand = [];
    this.folded = false;
    this.currentBet = 0;
    this.thinkingTime = this.getThinkingTime();
  }

  /**
   * GET THINKING TIME (simulates bot thinking)
   */
  getThinkingTime() {
    const min = 500;
    const max = this.difficulty === DIFFICULTY.EASY ? 1500 : 2500;
    return Math.random() * (max - min) + min;
  }

  /**
   * DECIDE ACTION (BET or FOLD)
   */
  decideAction(pot, currentStake, activePlayers, allPlayers) {
    const handStrength = this.evaluateHandStrength();
    const potOdds = this.calculatePotOdds(pot, currentStake);
    const playerCount = activePlayers.length;

    let foldThreshold, betProbability;

    // EASY BOT
    if (this.difficulty === DIFFICULTY.EASY) {
      foldThreshold = this.personality === PERSONALITIES.CAUTIOUS ? 0.6 : 0.4;
      betProbability = Math.random();

      if (handStrength < foldThreshold) {
        return 'fold';
      }
      return betProbability > 0.5 ? 'bet' : 'fold';
    }

    // MEDIUM BOT
    if (this.difficulty === DIFFICULTY.MEDIUM) {
      foldThreshold = this.personality === PERSONALITIES.CAUTIOUS ? 0.5 : 0.3;

      if (handStrength < foldThreshold) {
        return Math.random() > 0.7 ? 'bet' : 'fold'; // Occasional bluff
      }

      return 'bet';
    }

    // HARD BOT
    if (this.difficulty === DIFFICULTY.HARD) {
      foldThreshold = this.personality === PERSONALITIES.AGGRESSIVE ? 0.2 : 0.4;

      // Check pot odds
      if (potOdds < 2 && handStrength < 0.5) {
        return 'fold';
      }

      // Aggressive play with good hand
      if (handStrength > 0.7) {
        return 'bet';
      }

      // Semi-bluff with reasonable hand
      if (handStrength > 0.4 && playerCount <= 2) {
        return 'bet';
      }

      return handStrength > foldThreshold ? 'bet' : 'fold';
    }

    return 'fold';
  }

  /**
   * EVALUATE HAND STRENGTH (0 to 1)
   */
  evaluateHandStrength() {
    if (!this.hand || this.hand.length !== 3) {
      return 0;
    }

    const eval = evaluateHand(this.hand);

    const strengthMap = {
      trio: 1.0,
      sequence: 0.9,
      color: 0.8,
      pair: 0.6,
      highcard: 0.3,
    };

    let strength = strengthMap[eval.type] || 0.3;

    // Adjust based on high cards
    if (eval.highCard >= 12) {
      strength += 0.15;
    }

    return Math.min(strength, 1.0);
  }

  /**
   * CALCULATE POT ODDS
   */
  calculatePotOdds(pot, toBet) {
    if (toBet === 0) return 0;
    return pot / toBet;
  }

  /**
   * GET BET AMOUNT (fixed in MVP)
   */
  getBetAmount(minBet = 10) {
    // MVP: fixed bet amount
    if (this.coins < minBet) {
      return this.coins; // All-in
    }
    return minBet;
  }
}

/**
 * BOT MANAGER
 */
class BotManager {
  constructor() {
    this.bots = [];
  }

  /**
   * CREATE BOTS
   */
  createBots(count, difficulty = DIFFICULTY.MEDIUM) {
    const botNames = [
      'Alexa',
      'Shadow',
      'Phoenix',
      'Nova',
      'Titan',
      'Blaze',
    ];

    this.bots = [];

    for (let i = 0; i < count; i++) {
      const personality =
        Object.values(PERSONALITIES)[Math.floor(Math.random() * Object.values(PERSONALITIES).length)];

      const bot = new Bot(`bot-${i}`, botNames[i], difficulty, personality);
      this.bots.push(bot);
    }

    return this.bots;
  }

  /**
   * GET BOT BY ID
   */
  getBot(botId) {
    return this.bots.find((b) => b.id === botId);
  }

  /**
   * GET ALL BOTS
   */
  getAllBots() {
    return this.bots;
  }

  /**
   * RESET BOTS
   */
  resetBots() {
    this.bots.forEach((bot) => {
      bot.hand = [];
      bot.folded = false;
      bot.currentBet = 0;
    });
  }
}

module.exports = {
  Bot,
  BotManager,
  DIFFICULTY,
  PERSONALITIES,
};
