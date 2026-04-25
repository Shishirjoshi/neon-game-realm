/**
 * TEEN PATTI MULTIPLAYER SERVER
 * Node.js + Express + Socket.IO
 * Real-time multiplayer game backend
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import game modules
const GameManager = require('./gameManager');
const setupSocketHandlers = require('./socketHandlers');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Game Manager Instance
const gameManager = new GameManager();

// ============================================
// API ENDPOINTS
// ============================================

/**
 * HEALTH CHECK
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET ALL ROOMS
 */
app.get('/api/rooms', (req, res) => {
  try {
    const rooms = gameManager.getAllRooms();
    const sanitizedRooms = rooms.map((room) => ({
      roomId: room.roomId,
      roomName: room.roomName,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      state: room.state,
      pot: room.pot,
      createdAt: room.createdAt,
    }));

    res.json({
      success: true,
      rooms: sanitizedRooms,
      totalRooms: sanitizedRooms.length,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET ROOM DETAILS
 */
app.get('/api/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const room = gameManager.getRoom(roomId);

    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    // Sanitize room data (don't send hidden cards)
    const sanitizedRoom = {
      roomId: room.roomId,
      roomName: room.roomName,
      hostId: room.hostId,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        coins: p.coins,
        folded: p.folded,
        currentBet: p.currentBet,
        isActive: !p.folded,
      })),
      pot: room.pot,
      currentTurnIndex: room.currentTurnIndex,
      state: room.state,
    };

    res.json({ success: true, room: sanitizedRoom });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GAME STATISTICS
 */
app.get('/api/stats', (req, res) => {
  try {
    const rooms = gameManager.getAllRooms();
    const totalPlayers = rooms.reduce((sum, room) => sum + room.players.length, 0);

    const stats = {
      totalRooms: rooms.length,
      totalPlayers,
      activeGames: rooms.filter((r) => r.state === 'playing').length,
      waitingRooms: rooms.filter((r) => r.state === 'waiting').length,
      totalPot: rooms.reduce((sum, room) => sum + room.pot, 0),
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SOCKET.IO SETUP
// ============================================

setupSocketHandlers(io, gameManager);

// ============================================
// ERROR HANDLING
// ============================================

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   TEEN PATTI MULTIPLAYER SERVER        ║
╠════════════════════════════════════════╣
║   🎴 Game: Teen Patti MVP              ║
║   🚀 Server: ${PORT < 10000 ? 'http://localhost:' + PORT : 'Port ' + PORT}                   ║
║   📊 Status: Running                   ║
╚════════════════════════════════════════╝
  `);
});

module.exports = server;
