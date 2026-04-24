/**
 * Room Management
 * Handles room creation, player joining, and room cleanup
 */

import { v4 as uuidv4 } from 'uuid';
import TeenPattiGame from './teenpatti.js';
import Player from './players.js';

const ROOM_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

class Room {
  constructor(hostId, hostName, gameType = 'teen-patti', maxPlayers = 6) {
    this.roomId = uuidv4();
    this.code = this.generateRoomCode();
    this.hostId = hostId;
    this.hostName = hostName;
    this.gameType = gameType;
    this.maxPlayers = maxPlayers;
    this.players = new Map(); // playerId -> { socketId, username, coins }
    this.state = ROOM_STATES.WAITING;
    this.createdAt = new Date();
    this.game = null;

    // Initialize game based on type
    if (gameType === 'teen-patti') {
      this.game = new TeenPattiGame(this.roomId, maxPlayers);
    }
  }

  /**
   * Generate unique 6-character room code
   */
  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Add player to room
   * @param {string} playerId
   * @param {string} socketId
   * @param {string} username
   * @param {number} initialCoins - Initial coins in NPR (₨)
   */
  addPlayer(playerId, socketId, username, initialCoins = 1000) {
    if (this.players.size >= this.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    if (this.players.has(playerId)) {
      return { success: false, error: 'Player already in room' };
    }

    const seat = this.players.size;
    const player = new Player(playerId, username, initialCoins);
    player.seat = seat;

    this.players.set(playerId, { socketId, username, coins: initialCoins });

    if (this.game) {
      this.game.addPlayer(player, seat);
    }

    return { success: true, seat, roomCode: this.code };
  }

  /**
   * Remove player from room
   * @param {string} playerId
   */
  removePlayer(playerId) {
    this.players.delete(playerId);

    if (this.game) {
      this.game.removePlayer(playerId);
    }

    // If host leaves, transfer host to another player
    if (this.hostId === playerId && this.players.size > 0) {
      this.hostId = Array.from(this.players.keys())[0];
    }

    return this.players.size;
  }

  /**
   * Start the game
   */
  startGame() {
    if (this.state !== ROOM_STATES.WAITING) {
      return { success: false, error: 'Game already started' };
    }

    if (this.players.size < 2) {
      return { success: false, error: 'Minimum 2 players required' };
    }

    try {
      const gameState = this.game.startGame();
      this.state = ROOM_STATES.PLAYING;
      return { success: true, gameState };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Process player action in game
   * @param {string} playerId
   * @param {Object} action - { type, amount }
   */
  processPlayerAction(playerId, action) {
    if (this.state !== ROOM_STATES.PLAYING) {
      return { success: false, error: 'Game not in progress' };
    }

    const result = this.game.processAction(playerId, action);

    // Check if game is finished
    if (this.game.isGameFinished()) {
      this.state = ROOM_STATES.FINISHED;
      result.gameFinished = true;
      result.winner = this.game.activePlayers[0];
    }

    return result;
  }

  /**
   * Get room info for lobby
   */
  getRoomInfo() {
    return {
      roomId: this.roomId,
      code: this.code,
      hostId: this.hostId,
      hostName: this.hostName,
      gameType: this.gameType,
      state: this.state,
      playerCount: this.players.size,
      maxPlayers: this.maxPlayers,
      players: Array.from(this.players.entries()).map(([id, data]) => ({
        id,
        username: data.username,
        coins: data.coins,
        isHost: id === this.hostId
      })),
      createdAt: this.createdAt
    };
  }

  /**
   * Get game state
   * @param {string} playerId - Optional: get private view
   */
  getGameState(playerId = null) {
    if (!this.game) return null;
    return this.game.getGameState(playerId);
  }

  /**
   * Get player-specific view
   * @param {string} playerId
   */
  getPlayerView(playerId) {
    if (!this.game) return null;
    return this.game.getPlayerView(playerId);
  }

  /**
   * Check if room is empty
   */
  isEmpty() {
    return this.players.size === 0;
  }

  /**
   * Check if player exists in room
   */
  hasPlayer(playerId) {
    return this.players.has(playerId);
  }

  /**
   * Get all player IDs in room
   */
  getPlayerIds() {
    return Array.from(this.players.keys());
  }
}

export default Room;
export { ROOM_STATES };
