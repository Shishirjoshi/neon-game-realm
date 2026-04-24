/**
 * Teen Patti Game Logic
 * Handles game state, turns, betting, and win conditions
 */

import Deck from './deck.js';
import Player from './players.js';

const INITIAL_STAKE_NPR = 10; // ₨10
const GAME_STATES = {
  WAITING: 'waiting',
  DEALING: 'dealing',
  PLAYING: 'playing',
  SHOW: 'show',
  FINISHED: 'finished'
};

class TeenPattiGame {
  constructor(roomId, maxPlayers = 6) {
    this.roomId = roomId;
    this.maxPlayers = maxPlayers;
    this.players = new Map(); // playerId -> Player
    this.deck = new Deck();
    this.pot = 0; // Total pot in NPR (₨)
    this.currentStake = INITIAL_STAKE_NPR; // Current stake in NPR (₨)
    this.currentTurnIndex = 0;
    this.state = GAME_STATES.WAITING;
    this.roundNumber = 0;
    this.activePlayers = []; // Array of player IDs still in round
    this.gameHistory = [];
  }

  /**
   * Add player to game
   * @param {Player} player - Player object
   * @param {number} seat - Seat number (0-5)
   */
  addPlayer(player, seat) {
    player.seat = seat;
    this.players.set(player.id, player);
  }

  /**
   * Remove player from game
   * @param {string} playerId
   */
  removePlayer(playerId) {
    this.players.delete(playerId);
    this.activePlayers = this.activePlayers.filter(id => id !== playerId);
  }

  /**
   * Start the game
   * - Create fresh deck
   * - Deal 3 cards per player
   * - Set initial stake
   * - Initialize pot
   */
  startGame() {
    if (this.players.size < 2) {
      throw new Error('Minimum 2 players required to start game');
    }

    this.state = GAME_STATES.DEALING;
    this.roundNumber++;
    this.deck.reset();
    this.pot = 0;
    this.currentStake = INITIAL_STAKE_NPR;
    this.activePlayers = Array.from(this.players.keys());

    // Deal 3 cards to each player
    const playerIds = Array.from(this.players.keys());
    for (const playerId of playerIds) {
      const player = this.players.get(playerId);
      player.resetForNextRound();
      player.dealCards(this.deck.drawCards(3));
    }

    // Set first player to act
    this.currentTurnIndex = 0;

    this.state = GAME_STATES.PLAYING;
    return this.getGameState();
  }

  /**
   * Get player who needs to act
   */
  getCurrentPlayer() {
    if (this.activePlayers.length === 0) return null;
    const playerId = this.activePlayers[this.currentTurnIndex % this.activePlayers.length];
    return this.players.get(playerId);
  }

  /**
   * Get current player ID
   */
  getCurrentPlayerId() {
    const player = this.getCurrentPlayer();
    return player ? player.id : null;
  }

  /**
   * Move to next player's turn
   */
  nextTurn() {
    let attempts = 0;
    const maxAttempts = this.activePlayers.length;

    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.activePlayers.length;
      const playerId = this.activePlayers[this.currentTurnIndex];
      const player = this.players.get(playerId);

      if (player && !player.folded) {
        return playerId;
      }

      attempts++;
    } while (attempts < maxAttempts);

    return null;
  }

  /**
   * Validate player action
   * @param {string} playerId
   * @param {string} actionType - 'fold', 'see', 'bet'
   * @param {number} amount - Bet amount in NPR (₨)
   */
  validateAction(playerId, actionType, amount = 0) {
    const player = this.players.get(playerId);

    if (!player) {
      return { valid: false, error: 'Player not found' };
    }

    if (player.folded) {
      return { valid: false, error: 'Player already folded' };
    }

    if (this.getCurrentPlayerId() !== playerId) {
      return { valid: false, error: 'Not your turn' };
    }

    if (actionType === 'bet') {
      if (!amount || amount <= 0) {
        return { valid: false, error: 'Invalid bet amount' };
      }

      const limits = player.getBettingLimits(this.currentStake);
      if (amount < limits.min || amount > limits.max) {
        return {
          valid: false,
          error: `Bet must be between ₨${limits.min} and ₨${limits.max}`,
          limits
        };
      }

      if (!player.canAfford(amount)) {
        return { valid: false, error: 'Insufficient coins' };
      }
    } else if (actionType === 'see') {
      if (!player.isBlind) {
        return { valid: false, error: 'Already seen' };
      }
    } else if (actionType === 'fold') {
      // Fold is always valid
    } else {
      return { valid: false, error: 'Unknown action' };
    }

    return { valid: true };
  }

  /**
   * Handle player fold
   * @param {string} playerId
   */
  handleFold(playerId) {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.fold();
    this.activePlayers = this.activePlayers.filter(id => id !== playerId);

    // Check if only one player remains
    if (this.activePlayers.length === 1) {
      this.endGame();
      return true;
    }

    return true;
  }

  /**
   * Handle player seeing cards (becoming seen)
   * @param {string} playerId
   */
  handleSee(playerId) {
    const player = this.players.get(playerId);
    if (!player || !player.isBlind) return false;

    player.becomeSeen();
    return true;
  }

  /**
   * Handle player bet
   * @param {string} playerId
   * @param {number} amount - Bet amount in NPR (₨)
   */
  handleBet(playerId, amount) {
    const player = this.players.get(playerId);
    if (!player) return false;

    // Deduct coins from player
    if (!player.placeBet(amount)) {
      return false;
    }

    // Add to pot
    this.pot += amount;

    // Update current stake based on blind/seen status
    if (player.isBlind) {
      this.currentStake = amount;
    } else {
      this.currentStake = amount / 2;
    }

    return true;
  }

  /**
   * Process player action
   * @param {string} playerId
   * @param {Object} action - { type, amount }
   */
  processAction(playerId, action) {
    const validation = this.validateAction(playerId, action.type, action.amount);

    if (!validation.valid) {
      return { success: false, error: validation.error, limits: validation.limits };
    }

    let success = false;

    switch (action.type) {
      case 'fold':
        success = this.handleFold(playerId);
        break;
      case 'see':
        success = this.handleSee(playerId);
        break;
      case 'bet':
        success = this.handleBet(playerId, action.amount);
        break;
    }

    if (success) {
      this.nextTurn();
    }

    return { success, action: action.type, pot: this.pot };
  }

  /**
   * Check if game is finished
   */
  isGameFinished() {
    return this.activePlayers.length <= 1 || this.state === GAME_STATES.FINISHED;
  }

  /**
   * End game and determine winner
   */
  endGame() {
    if (this.activePlayers.length === 1) {
      const winnerId = this.activePlayers[0];
      const winner = this.players.get(winnerId);

      if (winner) {
        winner.addCoins(this.pot);

        this.gameHistory.push({
          round: this.roundNumber,
          winner: winnerId,
          winnerName: winner.name,
          potWon: this.pot,
          timestamp: new Date()
        });
      }
    }

    this.state = GAME_STATES.FINISHED;
  }

  /**
   * Get game state for clients
   * @param {string} playerId - Optional: get private view for specific player
   */
  getGameState(playerId = null) {
    const playersState = Array.from(this.players.values()).map(player => {
      // Show own cards only to that player
      if (playerId === player.id) {
        return player.getState(true);
      }
      return player.getPublicState();
    });

    return {
      roomId: this.roomId,
      state: this.state,
      roundNumber: this.roundNumber,
      players: playersState,
      pot: this.pot,
      currentStake: this.currentStake,
      currentTurnPlayerId: this.getCurrentPlayerId(),
      activePlayers: this.activePlayers,
      deck: {
        remaining: this.deck.getRemainingCards()
      }
    };
  }

  /**
   * Get player-specific game state
   * @param {string} playerId
   */
  getPlayerView(playerId) {
    const player = this.players.get(playerId);
    if (!player) return null;

    const gameState = this.getGameState(playerId);
    return {
      ...gameState,
      yourCards: player.hand,
      yourSeat: player.seat,
      yourCoins: player.coins,
      yourBet: player.currentBet,
      isYourTurn: this.getCurrentPlayerId() === playerId
    };
  }

  /**
   * Get all connected players
   */
  getPlayerCount() {
    return this.players.size;
  }

  /**
   * Get active players count
   */
  getActivePlayersCount() {
    return this.activePlayers.length;
  }

  /**
   * Reset game for new round
   */
  resetForNewRound() {
    this.pot = 0;
    this.currentStake = INITIAL_STAKE_NPR;
    this.currentTurnIndex = 0;
    this.activePlayers = Array.from(this.players.keys()).filter(
      id => this.players.get(id).isActive && this.players.get(id).coins > 0
    );

    // Reset player states
    for (const player of this.players.values()) {
      player.resetForNextRound();
    }

    // Deal new cards
    this.deck.reset();
    for (const player of this.players.values()) {
      player.dealCards(this.deck.drawCards(3));
    }

    this.state = GAME_STATES.PLAYING;
  }
}

export default TeenPattiGame;
export { GAME_STATES, INITIAL_STAKE_NPR };
