/**
 * Teen Patti Multiplayer Game Backend
 * Node.js + Socket.IO Server with NPR Currency System
 * 
 * Port: 3001 (or PORT environment variable)
 * Frontend: http://localhost:5173
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { initializeSocketHandlers } from './socket.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});

// ==================== REST ENDPOINTS ====================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Teen Patti Server is running' });
});

/**
 * Server info endpoint
 */
app.get('/info', (req, res) => {
  res.json({
    server: 'Teen Patti Multiplayer Backend',
    version: '1.0.0',
    port: PORT,
    frontend: FRONTEND_URL,
    gameType: 'teen-patti',
    currency: 'NPR (₨)',
    initialStake: '₨10'
  });
});

// ==================== SOCKET.IO SETUP ====================

// Initialize all socket handlers
initializeSocketHandlers(io);

// Log socket connections
io.on('connection', (socket) => {
  console.log(`\n✓ Client connected: ${socket.id}`);
  console.log(`  Total connections: ${io.engine.clientsCount}`);
});

// ==================== SERVER START ====================

server.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   Teen Patti Multiplayer Game Backend              ║');
  console.log('║   Node.js + Socket.IO + NPR Currency              ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`\n🎮 Server running on: http://localhost:${PORT}`);
  console.log(`📱 Frontend: ${FRONTEND_URL}`);
  console.log(`💱 Currency: NPR (₨)`);
  console.log(`♠️  Game: Teen Patti Poker`);
  console.log(`\n⚡ Socket.IO ready for connections`);
  console.log(`\nEndpoints:`);
  console.log(`  GET /health - Health check`);
  console.log(`  GET /info   - Server info`);
  console.log('\n');
});

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

export default server;
