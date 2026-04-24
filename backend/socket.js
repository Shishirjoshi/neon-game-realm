/**
 * Socket.IO Event Handlers
 * Handles all client-server communication
 */

import { v4 as uuidv4 } from 'uuid';
import Room from './rooms.js';

// Storage
const rooms = new Map(); // roomCode -> Room
const playerSockets = new Map(); // playerId -> socketId
const socketPlayers = new Map(); // socketId -> playerId

/**
 * Initialize Socket.IO handlers
 * @param {Server} io - Socket.IO server instance
 */
export function initializeSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[SOCKET] Player connected: ${socket.id}`);

    // ==================== ROOM EVENTS ====================

    /**
     * Create a new room
     * Event: createRoom
     * Data: { hostId, hostName, gameType }
     */
    socket.on('createRoom', (data, callback) => {
      try {
        const { hostId, hostName, gameType = 'teen-patti', maxPlayers = 6 } = data;

        if (!hostId || !hostName) {
          return callback({ success: false, error: 'Missing hostId or hostName' });
        }

        const room = new Room(hostId, hostName, gameType, maxPlayers);
        rooms.set(room.code, room);

        // Add host to room
        const addResult = room.addPlayer(hostId, socket.id, hostName);

        if (!addResult.success) {
          return callback(addResult);
        }

        // Store socket-player mapping
        playerSockets.set(hostId, socket.id);
        socketPlayers.set(socket.id, hostId);

        // Join socket to room code
        socket.join(room.code);

        console.log(`[ROOM] Created: ${room.code} by ${hostName}`);

        callback({
          success: true,
          roomCode: room.code,
          roomId: room.roomId,
          seat: addResult.seat
        });

        // Broadcast room update
        io.to(room.code).emit('roomUpdate', room.getRoomInfo());
      } catch (error) {
        console.error('[ERROR] createRoom:', error.message);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * Join an existing room
     * Event: joinRoom
     * Data: { roomCode, playerId, username }
     */
    socket.on('joinRoom', (data, callback) => {
      try {
        const { roomCode, playerId, username } = data;

        if (!roomCode || !playerId || !username) {
          return callback({
            success: false,
            error: 'Missing roomCode, playerId, or username'
          });
        }

        const room = rooms.get(roomCode);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        // Add player to room
        const addResult = room.addPlayer(playerId, socket.id, username);

        if (!addResult.success) {
          return callback(addResult);
        }

        // Store socket-player mapping
        playerSockets.set(playerId, socket.id);
        socketPlayers.set(socket.id, playerId);

        // Join socket to room code
        socket.join(roomCode);

        console.log(`[ROOM] ${username} joined: ${roomCode}`);

        callback({
          success: true,
          roomCode: room.code,
          roomId: room.roomId,
          seat: addResult.seat
        });

        // Broadcast room update to all in room
        io.to(roomCode).emit('roomUpdate', room.getRoomInfo());

        // Send initial game state
        socket.emit('gameState', room.getPlayerView(playerId));
      } catch (error) {
        console.error('[ERROR] joinRoom:', error.message);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * Leave a room
     * Event: leaveRoom
     * Data: { roomCode, playerId }
     */
    socket.on('leaveRoom', (data, callback) => {
      try {
        const { roomCode, playerId } = data;

        const room = rooms.get(roomCode);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        // Remove player from room
        const remainingPlayers = room.removePlayer(playerId);

        // Clean up socket mappings
        playerSockets.delete(playerId);
        socketPlayers.delete(socket.id);

        socket.leave(roomCode);

        console.log(`[ROOM] Player left: ${roomCode} (${remainingPlayers} remaining)`);

        callback({ success: true });

        // If room is empty, delete it
        if (remainingPlayers === 0) {
          rooms.delete(roomCode);
          console.log(`[ROOM] Deleted empty room: ${roomCode}`);
        } else {
          // Broadcast room update
          io.to(roomCode).emit('roomUpdate', room.getRoomInfo());
        }
      } catch (error) {
        console.error('[ERROR] leaveRoom:', error.message);
        callback({ success: false, error: error.message });
      }
    });

    // ==================== GAME EVENTS ====================

    /**
     * Start the game
     * Event: startGame
     * Data: { roomCode, playerId }
     */
    socket.on('startGame', (data, callback) => {
      try {
        const { roomCode, playerId } = data;

        const room = rooms.get(roomCode);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        // Verify player is host
        if (room.hostId !== playerId) {
          return callback({ success: false, error: 'Only host can start game' });
        }

        // Start game
        const result = room.startGame();

        if (!result.success) {
          return callback(result);
        }

        console.log(`[GAME] Started in room: ${roomCode}`);

        // Send game state to all players
        for (const pid of room.getPlayerIds()) {
          const playerSocket = playerSockets.get(pid);
          if (playerSocket) {
            io.to(playerSocket).emit('gameState', room.getPlayerView(pid));
          }
        }

        callback({ success: true });

        // Broadcast turn update
        io.to(roomCode).emit('turnUpdate', {
          currentPlayerId: room.game.getCurrentPlayerId(),
          currentStake: room.game.currentStake
        });
      } catch (error) {
        console.error('[ERROR] startGame:', error.message);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * Player performs an action (fold, bet, see, etc.)
     * Event: playerAction
     * Data: { roomCode, playerId, action: { type, amount } }
     */
    socket.on('playerAction', (data, callback) => {
      try {
        const { roomCode, playerId, action } = data;

        if (!action || !action.type) {
          return callback({ success: false, error: 'Invalid action' });
        }

        const room = rooms.get(roomCode);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        // Process action
        const result = room.processPlayerAction(playerId, action);

        if (!result.success) {
          return callback(result);
        }

        console.log(`[GAME] ${playerId} performed ${action.type} in ${roomCode}`);

        // Send action confirmation to player
        callback({ success: true });

        // Broadcast action to all players
        io.to(roomCode).emit('playerActionOccurred', {
          playerId,
          action: action.type,
          amount: action.amount,
          pot: room.game.pot,
          currentStake: room.game.currentStake
        });

        // Update turn
        io.to(roomCode).emit('turnUpdate', {
          currentPlayerId: room.game.getCurrentPlayerId(),
          currentStake: room.game.currentStake
        });

        // Send updated game state to all
        for (const pid of room.getPlayerIds()) {
          const playerSocket = playerSockets.get(pid);
          if (playerSocket) {
            io.to(playerSocket).emit('gameUpdate', room.getPlayerView(pid));
          }
        }

        // Check if game finished
        if (result.gameFinished) {
          io.to(roomCode).emit('gameFinished', {
            winner: result.winner,
            pot: room.game.pot,
            reason: 'All players folded except one'
          });
        }
      } catch (error) {
        console.error('[ERROR] playerAction:', error.message);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * Get room info
     * Event: getRoomInfo
     * Data: { roomCode }
     */
    socket.on('getRoomInfo', (data, callback) => {
      try {
        const { roomCode } = data;

        const room = rooms.get(roomCode);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        callback({ success: true, room: room.getRoomInfo() });
      } catch (error) {
        console.error('[ERROR] getRoomInfo:', error.message);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * Get game state
     * Event: getGameState
     * Data: { roomCode, playerId }
     */
    socket.on('getGameState', (data, callback) => {
      try {
        const { roomCode, playerId } = data;

        const room = rooms.get(roomCode);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        const gameState = room.getPlayerView(playerId);

        callback({ success: true, gameState });
      } catch (error) {
        console.error('[ERROR] getGameState:', error.message);
        callback({ success: false, error: error.message });
      }
    });

    // ==================== CONNECTION EVENTS ====================

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      try {
        const playerId = socketPlayers.get(socket.id);

        if (playerId) {
          console.log(`[SOCKET] Player disconnected: ${playerId}`);

          // Find room with this player
          for (const [roomCode, room] of rooms.entries()) {
            if (room.hasPlayer(playerId)) {
              room.removePlayer(playerId);

              // Notify others in room
              io.to(roomCode).emit('playerDisconnected', { playerId });
              io.to(roomCode).emit('roomUpdate', room.getRoomInfo());

              // Delete room if empty
              if (room.isEmpty()) {
                rooms.delete(roomCode);
              }

              break;
            }
          }

          playerSockets.delete(playerId);
        }

        socketPlayers.delete(socket.id);
      } catch (error) {
        console.error('[ERROR] disconnect:', error.message);
      }
    });

    // ==================== ADMIN EVENTS (for testing) ====================

    /**
     * Reset server (admin only - remove in production)
     */
    socket.on('adminResetServer', (data, callback) => {
      rooms.clear();
      playerSockets.clear();
      socketPlayers.clear();
      console.log('[ADMIN] Server reset');
      callback({ success: true });
    });

    /**
     * Get server stats (admin only - remove in production)
     */
    socket.on('adminGetStats', (data, callback) => {
      callback({
        roomCount: rooms.size,
        playerCount: playerSockets.size,
        activeConnections: Object.keys(io.sockets.sockets).length
      });
    });
  });
}

/**
 * Get room by code
 */
export function getRoom(roomCode) {
  return rooms.get(roomCode);
}

/**
 * Get all rooms
 */
export function getAllRooms() {
  return rooms;
}

/**
 * Broadcast event to room
 */
export function broadcastToRoom(io, roomCode, event, data) {
  io.to(roomCode).emit(event, data);
}
