/**
 * LOCAL GAME ENGINE
 * Offline game state management and simulation
 * Mimics server-side behavior for single-player/local multiplayer
 */

import type { GamePlayer, TeenPattiGameState } from '@/contexts/GameContext';
import { getBotDecision, getBotThinkDelay } from './teenpatti/botLogic';
import type { BotDifficulty } from './teenpatti/botLogic';
import type { Card } from './teenpatti/handEvaluator';

export interface LocalRoom {
  roomId: string;
  gameType: 'teen-patti' | 'typing' | 'other';
  players: GamePlayer[];
  currentTurnIndex: number;
  pot: number;
  minBet: number;
  currentBet: number;
  gamePhase: 'waiting' | 'dealing' | 'playing' | 'showdown' | 'completed';
  round: number;
  deck: Card[];
  playerHands: Record<string, Card[]>;
}

interface GameEngineCallbacks {
  onStateUpdate?: (state: Partial<TeenPattiGameState>) => void;
  onBotAction?: (playerId: string, action: string, amount: number) => void;
  onGameEnd?: (winners: string[]) => void;
  onError?: (error: string) => void;
}

/**
 * Create a deck of cards
 */
function createDeck(): Card[] {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = [
    '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A',
  ];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }

  return deck;
}

/**
 * Fisher-Yates shuffle
 */
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Main Local Game Engine
 */
export class LocalGameEngine {
  private room: LocalRoom;
  private callbacks: GameEngineCallbacks;
  private botDifficulties: Record<string, BotDifficulty>;
  private activeBotTimers: Map<string, NodeJS.Timeout>;

  constructor(
    gameType: 'teen-patti' | 'typing' | 'other',
    players: GamePlayer[],
    callbacks?: GameEngineCallbacks
  ) {
    this.room = {
      roomId: 'LOCAL-' + Date.now(),
      gameType,
      players,
      currentTurnIndex: 0,
      pot: 0,
      minBet: 50,
      currentBet: 0,
      gamePhase: 'waiting',
      round: 0,
      deck: shuffleDeck(createDeck()),
      playerHands: {},
    };

    this.callbacks = callbacks || {};
    this.botDifficulties = {};
    this.activeBotTimers = new Map();

    // Initialize player hands
    players.forEach((p) => {
      this.room.playerHands[p.id] = [];
    });
  }

  /**
   * Start the game
   */
  startGame(): void {
    this.room.gamePhase = 'dealing';
    this.room.round = 1;

    // Reset deck and hands
    this.room.deck = shuffleDeck(createDeck());
    Object.keys(this.room.playerHands).forEach((playerId) => {
      this.room.playerHands[playerId] = [];
    });

    this.dealCards();

    // Transition to playing phase
    setTimeout(() => {
      this.room.gamePhase = 'playing';
      this.room.currentTurnIndex = 0;
      this.emitStateUpdate();
      this.processNextTurn();
    }, 1500);
  }

  /**
   * Deal 3 cards to each player
   */
  private dealCards(): void {
    let cardIndex = 0;
    const activePlayers = this.room.players.filter((p) => p.status !== 'folded');

    activePlayers.forEach((player) => {
      if (cardIndex + 3 <= this.room.deck.length) {
        this.room.playerHands[player.id] = [
          this.room.deck[cardIndex++],
          this.room.deck[cardIndex++],
          this.room.deck[cardIndex++],
        ];
      }
    });

    this.emitStateUpdate();
  }

  /**
   * Set bot difficulty for a player
   */
  setBotDifficulty(playerId: string, difficulty: BotDifficulty): void {
    if (this.room.players.find((p) => p.id === playerId && 'isBot' in p)) {
      this.botDifficulties[playerId] = difficulty;
    }
  }

  /**
   * Process next turn
   */
  async processNextTurn(): Promise<void> {
    const activePlayers = this.room.players.filter((p) => p.status !== 'folded');

    if (activePlayers.length <= 1) {
      this.endRound();
      return;
    }

    // Find next active player
    let nextPlayerIndex = this.room.currentTurnIndex;
    let found = false;

    for (let i = 0; i < this.room.players.length; i++) {
      const idx = (this.room.currentTurnIndex + 1 + i) % this.room.players.length;
      if (this.room.players[idx].status !== 'folded') {
        nextPlayerIndex = idx;
        found = true;
        break;
      }
    }

    if (!found) {
      this.endRound();
      return;
    }

    this.room.currentTurnIndex = nextPlayerIndex;
    const currentPlayer = this.room.players[nextPlayerIndex];

    this.emitStateUpdate();

    // If bot, execute bot turn
    if ('isBot' in currentPlayer && currentPlayer.isBot) {
      await this.executeBotTurn(currentPlayer);
    }
  }

  /**
   * Execute a bot's turn
   */
  private async executeBotTurn(player: GamePlayer): Promise<void> {
    const difficulty = this.botDifficulties[player.id] || 'medium';
    const thinkDelay = getBotThinkDelay(difficulty);

    return new Promise<void>((resolve) => {
      // Clear any existing timer for this bot
      if (this.activeBotTimers.has(player.id)) {
        clearTimeout(this.activeBotTimers.get(player.id)!);
      }

      const timer = setTimeout(() => {
        const hand = this.room.playerHands[player.id] || [];
        const decision = getBotDecision(difficulty, hand, {
          currentBet: this.room.currentBet,
          minBet: this.room.minBet,
          pot: this.room.pot,
          playersRemaining: this.room.players.filter((p) => p.status !== 'folded')
            .length,
          round: this.room.round,
        }, player.coinBalance || 1000);

        this.callbacks.onBotAction?.(player.id, decision.action, decision.amount);
        this.handlePlayerAction(player.id, decision.action, decision.amount);

        this.activeBotTimers.delete(player.id);
        resolve();
      }, thinkDelay);

      this.activeBotTimers.set(player.id, timer);
    });
  }

  /**
   * Handle player action (human or bot)
   */
  handlePlayerAction(playerId: string, action: 'fold' | 'call' | 'raise' | 'check', amount: number = 0): void {
    const playerIndex = this.room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return;

    const player = this.room.players[playerIndex];

    switch (action) {
      case 'fold':
        player.status = 'folded';
        break;

      case 'call':
        if (player.coinBalance !== undefined) {
          const callAmount = Math.min(this.room.currentBet, player.coinBalance);
          player.coinBalance -= callAmount;
          this.room.pot += callAmount;
        }
        break;

      case 'raise':
        if (player.coinBalance !== undefined) {
          const totalAmount = Math.min(amount, player.coinBalance);
          player.coinBalance -= totalAmount;
          this.room.pot += totalAmount;
          this.room.currentBet = totalAmount;
        }
        break;

      case 'check':
        // No chips moved
        break;
    }

    this.emitStateUpdate();

    // Process next turn
    this.processNextTurn();
  }

  /**
   * End current round and determine winner
   */
  private endRound(): void {
    const activePlayers = this.room.players.filter((p) => p.status !== 'folded');

    if (activePlayers.length === 1) {
      // Everyone else folded
      const winner = activePlayers[0];
      winner.coinBalance = (winner.coinBalance || 0) + this.room.pot;
      this.room.gamePhase = 'completed';
      this.callbacks.onGameEnd?.([winner.id]);
    } else {
      // Showdown
      this.room.gamePhase = 'showdown';
      // Here you would compare hands and determine winner
      // For MVP, just give pot to random active player
      const winner = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      winner.coinBalance = (winner.coinBalance || 0) + this.room.pot;
      this.callbacks.onGameEnd?.([winner.id]);
    }

    this.emitStateUpdate();
  }

  /**
   * Emit state update to listeners
   */
  private emitStateUpdate(): void {
    if (!this.callbacks.onStateUpdate) return;

    const state: Partial<TeenPattiGameState> = {
      players: this.room.players,
      currentPlayerTurn: this.room.players[this.room.currentTurnIndex]?.id,
      pot: this.room.pot,
      minimumBet: this.room.minBet,
      gamePhase: this.room.gamePhase,
    };

    this.callbacks.onStateUpdate(state);
  }

  /**
   * Get current game state
   */
  getGameState(): LocalRoom {
    return { ...this.room };
  }

  /**
   * Reset the engine
   */
  reset(): void {
    // Clear all bot timers
    this.activeBotTimers.forEach((timer) => clearTimeout(timer));
    this.activeBotTimers.clear();

    // Reset room
    this.room.pot = 0;
    this.room.currentBet = 0;
    this.room.round = 0;
    this.room.gamePhase = 'waiting';
    this.room.players.forEach((p) => {
      p.status = 'idle';
    });
  }

  /**
   * Cleanup and destroy engine
   */
  destroy(): void {
    this.reset();
    this.activeBotTimers.clear();
  }
}
