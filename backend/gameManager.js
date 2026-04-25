/**
 * TEEN PATTI GAME MANAGER
 * Manages rooms, players, and game state
 */

const { v4: uuidv4 } = require('uuid');
const { dealCards, getNextActivePlayer, determineWinner } = require('./gameLogic');

/**
 * GAME MANAGER CLASS
 */
class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  /**
   * CREATE ROOM
   */
  createRoom(hostId, hostName, roomName) {
    const roomId = uuidv4();

    const room = {
      roomId,
      roomName: roomName || `Room ${roomId.slice(0, 8)}`,
      hostId,
      players: [
        {
          id: hostId,
          name: hostName,
          coins: 1000,
          hand: [],
          folded: false,
          currentBet: 0,
          socketId: null,
        },
      ],
      pot: 0,
      currentTurnIndex: 0,
      state: 'waiting', // waiting | playing | finished
      maxPlayers: 6,
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    console.log(`✓ Room created: ${roomName} (${roomId})`);
    return room;
  }

  /**
   * JOIN ROOM
   */
  joinRoom(roomId, socketId, playerId, playerName) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.state === 'playing') {
      return { success: false, error: 'Game already started' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    // Check if player already exists
    if (room.players.find((p) => p.id === playerId)) {
      return { success: false, error: 'Player already in room' };
    }

    const newPlayer = {
      id: playerId,
      name: playerName,
      coins: 1000,
      hand: [],
      folded: false,
      currentBet: 0,
      socketId,
    };

    room.players.push(newPlayer);
    console.log(`✓ Player joined: ${playerName} (Room: ${roomId})`);

    return { success: true, room };
  }

  /**
   * GET ROOM
   */
  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  /**
   * GET ALL ROOMS
   */
  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  /**
   * START GAME
   */
  startGame(roomId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.players.length < 2) {
      return { success: false, error: 'Need at least 2 players' };
    }

    // Initialize game
    room.state = 'playing';
    room.pot = 0;
    room.currentTurnIndex = 0;

    // Reset players
    room.players.forEach((player) => {
      player.hand = [];
      player.folded = false;
      player.currentBet = 0;
    });

    // Deal cards
    dealCards(room.players);

    console.log(`✓ Game started in room ${roomId}`);
    return { success: true, room };
  }

  /**
   * PLAYER ACTION: BET
   */
  playerBet(roomId, playerId, amount = 10) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const player = room.players.find((p) => p.id === playerId);

    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    if (room.players[room.currentTurnIndex].id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (player.coins < amount) {
      return { success: false, error: 'Insufficient coins' };
    }

    if (player.folded) {
      return { success: false, error: 'Player has folded' };
    }

    // Deduct from player and add to pot
    player.coins -= amount;
    player.currentBet += amount;
    room.pot += amount;

    console.log(`✓ Player ${player.name} bet ₨${amount} (Pot: ₨${room.pot})`);

    // Move to next turn
    this.nextTurn(roomId);

    return { success: true, room };
  }

  /**
   * PLAYER ACTION: FOLD
   */
  playerFold(roomId, playerId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const player = room.players.find((p) => p.id === playerId);

    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    if (room.players[room.currentTurnIndex].id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (player.folded) {
      return { success: false, error: 'Player already folded' };
    }

    player.folded = true;
    console.log(`✓ Player ${player.name} folded`);

    // Check if game should end
    const activePlayers = room.players.filter((p) => !p.folded);

    if (activePlayers.length === 1) {
      return this.endGame(roomId);
    }

    // Move to next turn
    this.nextTurn(roomId);

    return { success: true, room };
  }

  /**
   * NEXT TURN
   */
  nextTurn(roomId) {
    const room = this.rooms.get(roomId);

    if (!room) return;

    const nextIndex = getNextActivePlayer(room.players, room.currentTurnIndex);

    if (nextIndex === -1) {
      // No more active players, end game
      return this.endGame(roomId);
    }

    room.currentTurnIndex = nextIndex;
  }

  /**
   * END GAME
   * Determines winner and distributes pot
   */
  endGame(roomId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const winner = determineWinner(room.players);

    if (!winner) {
      return { success: false, error: 'No valid winner' };
    }

    // Award pot to winner
    winner.coins += room.pot;

    room.state = 'finished';

    console.log(`✓ Game ended. Winner: ${winner.name} (Won ₨${room.pot})`);

    return {
      success: true,
      winner,
      pot: room.pot,
      room,
    };
  }

  /**
   * LEAVE ROOM
   */
  leaveRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const playerIndex = room.players.findIndex((p) => p.id === playerId);

    if (playerIndex === -1) {
      return { success: false, error: 'Player not in room' };
    }

    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);

    console.log(`✓ Player ${player.name} left room ${roomId}`);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      console.log(`✓ Room deleted: ${roomId}`);
    }

    return { success: true };
  }

  /**
   * DELETE ROOM
   */
  deleteRoom(roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.delete(roomId);
      console.log(`✓ Room deleted: ${roomId}`);
      return { success: true };
    }
    return { success: false, error: 'Room not found' };
  }

  /**
   * RESET GAME (for next round)
   */
  resetGame(roomId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    room.state = 'waiting';
    room.pot = 0;
    room.currentTurnIndex = 0;

    room.players.forEach((player) => {
      player.hand = [];
      player.folded = false;
      player.currentBet = 0;
    });

    console.log(`✓ Game reset in room ${roomId}`);
    return { success: true, room };
  }
}

module.exports = GameManager;
