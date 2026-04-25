/**
 * TEEN PATTI SOCKET.IO EVENT HANDLERS
 * Handles all real-time game events
 */

/**
 * SETUP SOCKET HANDLERS
 */
const setupSocketHandlers = (io, gameManager) => {
  io.on('connection', (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    /**
     * CREATE ROOM
     * Event: client -> server
     * Payload: { hostName, roomName }
     */
    socket.on('createRoom', (data, callback) => {
      try {
        const { hostName, roomName } = data;

        if (!hostName) {
          return callback({ success: false, error: 'Host name required' });
        }

        const room = gameManager.createRoom(socket.id, hostName, roomName);

        // Join socket to room
        socket.join(room.roomId);

        callback({ success: true, room });

        // Broadcast room update
        io.emit('roomCreated', {
          room,
          totalRooms: gameManager.getAllRooms().length,
        });
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * JOIN ROOM
     * Event: client -> server
     * Payload: { roomId, playerName, playerId }
     */
    socket.on('joinRoom', (data, callback) => {
      try {
        const { roomId, playerName, playerId } = data;

        if (!roomId || !playerName) {
          return callback({ success: false, error: 'Room ID and player name required' });
        }

        const result = gameManager.joinRoom(roomId, socket.id, playerId || socket.id, playerName);

        if (!result.success) {
          return callback(result);
        }

        // Join socket to room
        socket.join(roomId);

        callback({ success: true, room: result.room });

        // Broadcast room update to all players in room
        io.to(roomId).emit('roomUpdate', {
          room: result.room,
          message: `${playerName} joined the room`,
        });
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * GET ROOM
     * Event: client -> server
     * Payload: { roomId }
     */
    socket.on('getRoom', (data, callback) => {
      try {
        const { roomId } = data;
        const room = gameManager.getRoom(roomId);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        callback({ success: true, room });
      } catch (error) {
        console.error('Error getting room:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * GET ALL ROOMS
     * Event: client -> server
     */
    socket.on('getAllRooms', (callback) => {
      try {
        const rooms = gameManager.getAllRooms();
        callback({ success: true, rooms });
      } catch (error) {
        console.error('Error getting rooms:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * START GAME
     * Event: client -> server
     * Payload: { roomId }
     * Only host can start game
     */
    socket.on('startGame', (data, callback) => {
      try {
        const { roomId } = data;
        const room = gameManager.getRoom(roomId);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        if (room.hostId !== socket.id) {
          return callback({ success: false, error: 'Only host can start game' });
        }

        const result = gameManager.startGame(roomId);

        if (!result.success) {
          return callback(result);
        }

        callback({ success: true, room: result.room });

        // Broadcast game started to all players in room
        io.to(roomId).emit('gameStarted', {
          room: result.room,
          currentPlayerTurn: result.room.players[result.room.currentTurnIndex],
        });
      } catch (error) {
        console.error('Error starting game:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * PLAYER ACTION: BET
     * Event: client -> server
     * Payload: { roomId, playerId, amount }
     */
    socket.on('playerBet', (data, callback) => {
      try {
        const { roomId, playerId, amount = 10 } = data;

        const result = gameManager.playerBet(roomId, playerId, amount);

        if (!result.success) {
          return callback(result);
        }

        const room = result.room;
        const currentPlayer = room.players[room.currentTurnIndex];

        callback({ success: true, room });

        // Broadcast game update to all players in room
        io.to(roomId).emit('gameUpdate', {
          room,
          action: 'bet',
          player: room.players.find((p) => p.id === playerId),
          amount,
          currentPlayerTurn: currentPlayer,
        });
      } catch (error) {
        console.error('Error in playerBet:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * PLAYER ACTION: FOLD
     * Event: client -> server
     * Payload: { roomId, playerId }
     */
    socket.on('playerFold', (data, callback) => {
      try {
        const { roomId, playerId } = data;

        const result = gameManager.playerFold(roomId, playerId);

        if (!result.success) {
          return callback(result);
        }

        const room = result.room;

        // Check if game ended
        if (room.state === 'finished') {
          const endResult = gameManager.endGame(roomId);
          return handleGameEnd(roomId, endResult, callback);
        }

        const currentPlayer = room.players[room.currentTurnIndex];

        callback({ success: true, room });

        // Broadcast game update
        io.to(roomId).emit('gameUpdate', {
          room,
          action: 'fold',
          player: room.players.find((p) => p.id === playerId),
          currentPlayerTurn: currentPlayer,
        });
      } catch (error) {
        console.error('Error in playerFold:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * END GAME (Finish betting round)
     * Event: client -> server
     * Payload: { roomId }
     * Called when all players have acted
     */
    socket.on('finishBettingRound', (data, callback) => {
      try {
        const { roomId } = data;
        const room = gameManager.getRoom(roomId);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        const result = gameManager.endGame(roomId);

        if (!result.success) {
          return callback(result);
        }

        callback({ success: true, winner: result.winner, pot: result.pot });

        // Broadcast game end to all players
        io.to(roomId).emit('gameEnd', {
          winner: result.winner,
          pot: result.pot,
          players: result.room.players,
        });
      } catch (error) {
        console.error('Error ending game:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * RESET GAME (Start new round)
     * Event: client -> server
     * Payload: { roomId }
     */
    socket.on('resetGame', (data, callback) => {
      try {
        const { roomId } = data;
        const result = gameManager.resetGame(roomId);

        if (!result.success) {
          return callback(result);
        }

        callback({ success: true, room: result.room });

        // Broadcast reset to all players
        io.to(roomId).emit('gameReset', {
          room: result.room,
        });
      } catch (error) {
        console.error('Error resetting game:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * LEAVE ROOM
     * Event: client -> server
     * Payload: { roomId, playerId }
     */
    socket.on('leaveRoom', (data, callback) => {
      try {
        const { roomId, playerId } = data;
        const result = gameManager.leaveRoom(roomId, playerId);

        if (!result.success) {
          return callback(result);
        }

        socket.leave(roomId);
        callback({ success: true });

        // Broadcast player left
        io.to(roomId).emit('roomUpdate', {
          room: gameManager.getRoom(roomId),
          message: 'Player left the room',
        });
      } catch (error) {
        console.error('Error leaving room:', error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * DISCONNECT
     */
    socket.on('disconnect', () => {
      console.log(`✗ Client disconnected: ${socket.id}`);

      // Clean up: remove player from all rooms
      const rooms = gameManager.getAllRooms();
      rooms.forEach((room) => {
        const player = room.players.find((p) => p.socketId === socket.id);
        if (player) {
          gameManager.leaveRoom(room.roomId, player.id);

          // Notify other players
          io.to(room.roomId).emit('roomUpdate', {
            room: gameManager.getRoom(room.roomId),
            message: `${player.name} disconnected`,
          });
        }
      });
    });
  });
};

/**
 * HELPER: Handle game end
 */
const handleGameEnd = (roomId, result, callback) => {
  if (callback) {
    callback({ success: true, winner: result.winner, pot: result.pot });
  }

  return {
    winner: result.winner,
    pot: result.pot,
    room: result.room,
  };
};

module.exports = setupSocketHandlers;
