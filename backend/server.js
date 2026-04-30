/**
 * TEEN PATTI BACKEND - FULL STACK MVP
 * Express + Socket.IO
 * Port: 5000
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './game.js';

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors());
app.use(express.json());

// Game Manager
const gameManager = new GameManager();

// Store typing game rooms
const typingRooms = new Map();

// ========================================
// REST ENDPOINTS
// ========================================

app.get('/', (req, res) => {
  res.json({ status: 'Game Server Running', port: PORT });
});

// ========================================
// SOCKET EVENTS
// ========================================

io.on('connection', (socket) => {
  console.log(`✓ Client connected: ${socket.id}`);

  // CREATE ROOM
  socket.on('createRoom', (data) => {
    const { playerName } = data;
    const room = gameManager.createRoom(socket.id, playerName);
    socket.join(room.roomId);
    socket.emit('roomCreated', room);
    console.log(`✓ Room created: ${room.roomId}`);
  });

  // JOIN ROOM
  socket.on('joinRoom', (data) => {
    const { roomId, playerName } = data;
    const room = gameManager.joinRoom(roomId, socket.id, playerName);
    
    if (!room) {
      socket.emit('error', 'Room not found or full');
      return;
    }

    socket.join(roomId);
    io.to(roomId).emit('roomUpdate', room);
    console.log(`✓ Player joined: ${roomId}`);
  });

  // START GAME
  socket.on('startGame', (data) => {
    const { roomId } = data;
    const room = gameManager.startGame(roomId);
    
    if (!room) {
      socket.emit('error', 'Cannot start game');
      return;
    }

    io.to(roomId).emit('gameStarted', room);
    console.log(`✓ Game started: ${roomId}`);
  });

  // PLAYER ACTION
  socket.on('playerAction', (data) => {
    const { roomId, action } = data;
    const room = gameManager.playerAction(roomId, socket.id, action);
    
    if (!room) {
      socket.emit('error', 'Invalid action');
      return;
    }

    io.to(roomId).emit('gameUpdate', room);
    
    // Check if game ended
    if (room.state === 'finished') {
      io.to(roomId).emit('gameEnd', room);
    }
  });

  // ========================================
  // TYPING GAME EVENTS
  // ========================================

  // JOIN GAME (for multiplayer rooms from database)
  socket.on('joinGame', (data) => {
    const { roomCode, userId, gameType, username } = data;
    
    if (gameType === 'typing') {
      // Find or create typing room
      if (!typingRooms.has(roomCode)) {
        typingRooms.set(roomCode, {
          code: roomCode,
          type: 'typing',
          players: [],
          leaderboard: [],
          textToType: 'The quick brown fox jumps over the lazy dog. Master your typing speed and accuracy to claim victory.',
          gamePhase: 'waiting',
          timeRemaining: 60,
          startTime: null,
        });
      }

      const room = typingRooms.get(roomCode);
      
      // Add player if not already there
      if (!room.players.find(p => p.userId === userId)) {
        room.players.push({
          userId,
          username,
          socketId: socket.id,
        });
        room.leaderboard.push({
          userId,
          username,
          wpm: 0,
          progress: 0,
          accuracy: 100,
        });
      }

      socket.join(roomCode);

      // Send game state to joining player
      socket.emit('gameState', {
        type: 'typing',
        players: room.players.map(p => ({
          id: p.userId,
          username: p.username,
          seat: room.players.indexOf(p),
          isReady: true,
          status: 'playing',
        })),
        textToType: room.textToType,
        leaderboard: room.leaderboard,
        yourProgress: 0,
        yourWPM: 0,
        yourAccuracy: 100,
        gamePhase: room.gamePhase,
        timeRemaining: room.timeRemaining,
      });

      // Notify others
      io.to(roomCode).emit('playerJoined', {
        userId,
        username,
      });

      console.log(`✓ Player joined typing room: ${roomCode}`);
    }
  });

  // TYPING UPDATE
  socket.on('typingUpdate', (data) => {
    const { roomCode, userId, text, wpm, accuracy, progress } = data;
    
    if (typingRooms.has(roomCode)) {
      const room = typingRooms.get(roomCode);
      const leaderboardEntry = room.leaderboard.find(p => p.userId === userId);
      
      if (leaderboardEntry) {
        leaderboardEntry.wpm = wpm;
        leaderboardEntry.accuracy = accuracy;
        leaderboardEntry.progress = progress;

        // Sort leaderboard by progress/wpm
        room.leaderboard.sort((a, b) => {
          if (b.progress !== a.progress) return b.progress - a.progress;
          return b.wpm - a.wpm;
        });

        // Broadcast updated leaderboard
        io.to(roomCode).emit('leaderboardUpdate', room.leaderboard);

        // Check if player finished
        if (progress >= 1) {
          io.to(roomCode).emit('gameUpdate', {
            gamePhase: 'finished',
          });
        }
      }
    }
  });

  // START TYPING GAME
  socket.on('startTypingGame', (data) => {
    const { roomCode } = data;
    
    if (typingRooms.has(roomCode)) {
      const room = typingRooms.get(roomCode);
      room.gamePhase = 'playing';
      room.startTime = Date.now();
      
      io.to(roomCode).emit('gameUpdate', {
        gamePhase: 'playing',
        timeRemaining: 60,
      });

      console.log(`✓ Typing game started: ${roomCode}`);
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    console.log(`✗ Client disconnected: ${socket.id}`);
  });
});

// ========================================
// START SERVER
// ========================================

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  MULTIPLAYER GAME BACKEND               ║
║  Teen Patti + Typing Race               ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                 ║
║  Games: Teen Patti, Typing Race         ║
║  Socket.IO: Real-time Multiplayer       ║
╚════════════════════════════════════════╝
  `);
});

export { io, gameManager };
