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
║  Teen Patti + Chess                     ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                 ║
║  Games: Teen Patti, Chess               ║
║  Socket.IO: Real-time Multiplayer       ║
╚════════════════════════════════════════╝
  `);
});

export { io, gameManager };
