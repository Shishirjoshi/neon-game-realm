# Backend Setup Guide - Socket.IO Server

This guide shows how to set up a Socket.IO backend server for the Neon Game Realm multiplayer platform.

## Quick Setup

### 1. Initialize Project
```bash
mkdir game-server
cd game-server
npm init -y
npm install express socket.io cors uuid
npm install --save-dev nodemon
```

### 2. Create `package.json` Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 3. Create `server.js`

```javascript
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuid } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const server = require('http').createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Game rooms storage
const rooms = new Map();
const players = new Map();

// Helper functions
function getRoom(code) {
  return rooms.get(code);
}

function addRoom(code, roomData) {
  rooms.set(code, roomData);
}

function removeRoom(code) {
  rooms.delete(code);
}

function generateGameState(gameType, room) {
  if (gameType === 'teen-patti') {
    return {
      type: 'teen-patti',
      players: room.players.map(p => ({
        id: p.userId,
        username: p.username,
        seat: p.seat,
        status: 'playing',
        coinBalance: p.coinBalance || 1000,
        isReady: p.isReady || false
      })),
      currentPlayerTurn: room.currentPlayerTurn || room.players[0]?.userId,
      communityCards: room.communityCards || [],
      pot: room.pot || 0,
      minimumBet: room.minimumBet || 50,
      yourCards: [], // Will be set per player
      yourSeat: 0, // Will be set per player
      gamePhase: room.gamePhase || 'waiting',
      roundHistory: room.roundHistory || []
    };
  } else if (gameType === 'typing') {
    return {
      type: 'typing',
      players: room.players.map(p => ({
        id: p.userId,
        username: p.username,
        seat: p.seat,
        status: 'playing',
        isReady: p.isReady || false
      })),
      textToType: room.textToType || 'The quick brown fox jumps over the lazy dog',
      leaderboard: room.leaderboard || room.players.map(p => ({
        userId: p.userId,
        username: p.username,
        wpm: 0,
        progress: 0,
        accuracy: 100
      })),
      yourProgress: 0,
      yourWPM: 0,
      yourAccuracy: 100,
      gamePhase: room.gamePhase || 'waiting',
      timeRemaining: room.timeRemaining || 60
    };
  }
}

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinGame', ({ roomCode, userId, gameType, username }) => {
    console.log(`${username} joining room ${roomCode}`);

    try {
      // Get or create room
      let room = getRoom(roomCode);
      
      if (!room) {
        room = {
          code: roomCode,
          gameType,
          players: [],
          currentPlayerTurn: null,
          pot: 0,
          minimumBet: 50,
          communityCards: [],
          gamePhase: 'waiting',
          leaderboard: [],
          textToType: 'The quick brown fox jumps over the lazy dog. Speed is the name of the game!',
          timeRemaining: 60
        };
        addRoom(roomCode, room);
      }

      // Add player to room
      const seat = room.players.length;
      const player = {
        userId,
        username,
        seat,
        socketId: socket.id,
        isReady: false,
        coinBalance: 1000
      };

      room.players.push(player);
      players.set(socket.id, { roomCode, userId, username });

      // Join socket to room
      socket.join(`room:${roomCode}`);

      // Send game state to joining player
      const gameState = generateGameState(gameType, room);
      socket.emit('gameState', gameState);

      // Notify others
      socket.to(`room:${roomCode}`).emit('playerJoined', {
        userId,
        username,
        seat
      });

      // Send updated game state to all
      io.to(`room:${roomCode}`).emit('gameUpdate', {
        players: gameState.players
      });

      console.log(`Room ${roomCode} now has ${room.players.length} players`);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', 'Failed to join game');
    }
  });

  socket.on('gameAction', ({ roomCode, userId, action, amount }) => {
    const room = getRoom(roomCode);
    if (!room) return;

    console.log(`Player ${userId} action: ${action}`);

    // Process action based on game type
    if (room.gameType === 'teen-patti') {
      // Update pot for raise
      if (action === 'raise') {
        room.pot += amount;
      } else if (action === 'call') {
        room.pot += room.minimumBet;
      }

      // Move to next player
      const currentIdx = room.players.findIndex(p => p.userId === room.currentPlayerTurn);
      const nextIdx = (currentIdx + 1) % room.players.length;
      room.currentPlayerTurn = room.players[nextIdx].userId;

      // Broadcast update
      io.to(`room:${roomCode}`).emit('playerAction', {
        playerId: userId,
        action,
        amount
      });

      io.to(`room:${roomCode}`).emit('gameUpdate', {
        pot: room.pot,
        currentPlayerTurn: room.currentPlayerTurn
      });
    }
  });

  socket.on('typingUpdate', ({ roomCode, userId, wpm, accuracy, progress }) => {
    const room = getRoom(roomCode);
    if (!room) return;

    // Update leaderboard
    const playerIdx = room.leaderboard.findIndex(p => p.userId === userId);
    if (playerIdx >= 0) {
      room.leaderboard[playerIdx] = { ...room.leaderboard[playerIdx], wpm, accuracy, progress };
    } else {
      const player = room.players.find(p => p.userId === userId);
      room.leaderboard.push({
        userId,
        username: player?.username || 'Unknown',
        wpm,
        accuracy,
        progress
      });
    }

    // Broadcast leaderboard update
    io.to(`room:${roomCode}`).emit('leaderboardUpdate', room.leaderboard);
  });

  socket.on('startGame', ({ roomCode, hostId }) => {
    const room = getRoom(roomCode);
    if (!room || room.gamePhase !== 'waiting') return;

    console.log(`Starting game in room ${roomCode}`);

    room.gamePhase = 'counting';

    io.to(`room:${roomCode}`).emit('gameUpdate', {
      gamePhase: 'counting'
    });

    // Start countdown
    let countdown = 3;
    const countInterval = setInterval(() => {
      if (countdown === 0) {
        clearInterval(countInterval);
        room.gamePhase = 'active';
        room.timeRemaining = 60;

        io.to(`room:${roomCode}`).emit('gameUpdate', {
          gamePhase: 'active',
          timeRemaining: room.timeRemaining
        });

        // Timer for typing game
        if (room.gameType === 'typing') {
          const timerInterval = setInterval(() => {
            room.timeRemaining--;
            io.to(`room:${roomCode}`).emit('gameUpdate', {
              timeRemaining: room.timeRemaining
            });

            if (room.timeRemaining <= 0) {
              clearInterval(timerInterval);
              room.gamePhase = 'completed';
              io.to(`room:${roomCode}`).emit('gameUpdate', {
                gamePhase: 'completed'
              });
            }
          }, 1000);
        }
      } else {
        io.to(`room:${roomCode}`).emit('gameUpdate', {
          countdownSeconds: countdown
        });
        countdown--;
      }
    }, 1000);
  });

  socket.on('leaveGame', ({ roomCode, userId }) => {
    const room = getRoom(roomCode);
    if (!room) return;

    room.players = room.players.filter(p => p.userId !== userId);

    io.to(`room:${roomCode}`).emit('playerLeft', { userId });

    if (room.players.length === 0) {
      removeRoom(roomCode);
      console.log(`Deleted empty room ${roomCode}`);
    }
  });

  socket.on('disconnect', () => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const { roomCode, userId } = playerData;
      const room = getRoom(roomCode);

      if (room) {
        room.players = room.players.filter(p => p.userId !== userId);
        io.to(`room:${roomCode}`).emit('playerLeft', { userId });

        if (room.players.length === 0) {
          removeRoom(roomCode);
        }
      }

      players.delete(socket.id);
    }

    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// REST Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

app.get('/rooms', (req, res) => {
  const roomsList = Array.from(rooms.entries()).map(([code, room]) => ({
    code,
    gameType: room.gameType,
    players: room.players.length,
    maxPlayers: 6,
    gamePhase: room.gamePhase
  }));
  res.json(roomsList);
});

server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
```

### 4. Run Server
```bash
npm run dev
```

Server will be available at `http://localhost:3001`

## Deployment

### Heroku
```bash
git init
heroku create your-app-name
git push heroku main
```

### Railway / Render
1. Connect your Git repository
2. Set environment variables:
   - `FRONTEND_URL` - Your frontend URL
   - `PORT` - Usually 3001

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Environment Variables

```bash
# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Server port
PORT=3001

# Database URL (optional, for persistence)
DATABASE_URL=postgresql://...
```

## Production Considerations

1. **Database Persistence** - Save games, players, scores
2. **Authentication** - Verify tokens from Supabase
3. **Rate Limiting** - Prevent abuse
4. **Monitoring** - Track errors and performance
5. **Load Balancing** - Scale to multiple server instances
6. **Redis** - For session management across servers

## Advanced Features

- Add database for persistent game history
- Implement anti-cheat measures
- Add friend/party system
- Implement ranking/ELO system
- Add spectator mode via Socket.IO namespaces
- Integrate payment system for in-game currency

## Troubleshooting

### CORS Errors
Check `FRONTEND_URL` environment variable matches your frontend URL.

### Connection Timeouts
- Check firewall/network settings
- Verify PORT is not blocked
- Check Socket.IO client configuration

### Memory Leaks
- Ensure rooms are deleted when empty
- Cleanup listeners on disconnect
- Monitor active connections
