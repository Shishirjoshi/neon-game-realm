/**
 * Player Management
 * Handles player state, coins (NPR), and game actions
 */

class Player {
  constructor(id, name, initialCoins = 1000) {
    this.id = id;
    this.name = name;
    this.coins = initialCoins; // Coins in NPR (₨)
    this.hand = []; // 3 cards dealt
    this.isBlind = true; // Starts as blind
    this.folded = false;
    this.currentBet = 0;
    this.totalBetThisRound = 0;
    this.isActive = true; // Player is still in the game
    this.seat = -1; // Will be assigned by room
  }

  /**
   * Deal cards to player
   * @param {Array} cards - Array of card objects
   */
  dealCards(cards) {
    this.hand = cards;
  }

  /**
   * Place a bet
   * @param {number} amount - Bet amount in NPR (₨)
   * @returns {boolean} - Success status
   */
  placeBet(amount) {
    if (amount > this.coins) {
      return false; // Insufficient coins
    }

    this.coins -= amount;
    this.currentBet += amount;
    this.totalBetThisRound += amount;
    return true;
  }

  /**
   * Win coins (add to wallet)
   * @param {number} amount - Winning amount in NPR (₨)
   */
  addCoins(amount) {
    this.coins += amount;
  }

  /**
   * Reset player for next round
   */
  resetForNextRound() {
    this.hand = [];
    this.isBlind = true;
    this.folded = false;
    this.currentBet = 0;
    this.totalBetThisRound = 0;
  }

  /**
   * Fold the player's hand
   */
  fold() {
    this.folded = true;
  }

  /**
   * Become seen (no longer blind)
   */
  becomeSeen() {
    this.isBlind = false;
  }

  /**
   * Get player state for client
   * @param {boolean} showHand - Whether to show hand (only for this player)
   */
  getState(showHand = false) {
    return {
      id: this.id,
      name: this.name,
      coins: this.coins,
      hand: showHand ? this.hand : [], // Hide hand from other players
      isBlind: this.isBlind,
      folded: this.folded,
      currentBet: this.currentBet,
      totalBetThisRound: this.totalBetThisRound,
      isActive: this.isActive,
      seat: this.seat
    };
  }

  /**
   * Get public player info (no cards or coins shown to others)
   */
  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      coins: this.coins,
      isBlind: this.isBlind,
      folded: this.folded,
      currentBet: this.currentBet,
      isActive: this.isActive,
      seat: this.seat
    };
  }

  /**
   * Check if player can afford a bet
   * @param {number} amount - Amount in NPR (₨)
   */
  canAfford(amount) {
    return amount <= this.coins;
  }

  /**
   * Get betting limits based on blind/seen status
   * @param {number} currentStake - Current stake in NPR (₨)
   */
  getBettingLimits(currentStake) {
    if (this.isBlind) {
      return {
        min: currentStake,
        max: currentStake * 2,
        multiplier: 'blind'
      };
    } else {
      return {
        min: currentStake * 2,
        max: currentStake * 4,
        multiplier: 'seen'
      };
    }
  }
}

export default Player;
