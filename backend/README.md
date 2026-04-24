# Teen Patti Multiplayer Game Backend

A production-ready Node.js + Socket.IO backend server for Teen Patti (Indian Poker) with a **Nepalese Rupees (₨) currency system**.

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Run Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:3001`

## 📋 System Architecture

```
Socket.IO Server
├── Room Management (rooms.js)
├── Teen Patti Game Logic (teenpatti.js)
├── Player Management (players.js)
├── Card Deck System (deck.js)
└── Socket Event Handlers (socket.js)
```

## 💱 Currency System (NPR)

- **1 UNIT = ₨10** (Nepalese Rupees)
- All bets, pots, and coins handled in **NPR only**
- No "unit" strings in backend logic
- Examples:
  - 1 unit = ₨10
  - 5 units = ₨50
  - 10 units = ₨100

## 🎮 Core Game Features

### Room System

- `createRoom(hostId, hostName)` - Create new game room
- `joinRoom(roomCode, playerId, username)` - Join existing room
- Max 6 players per room

### Player Structure

```javascript
{
  id,                    // Unique player ID
  name,                  // Username
  coins,                 // Wallet in NPR (₨)
  hand,                  // 3 cards dealt
  isBlind,              // Blind or seen status
  folded,               // Is player out of round
  currentBet,           // Current bet amount in NPR
  totalBetThisRound,    // Total bet this round in NPR
  seat                  // Table position (0-5)
}
```

### Blind/Seen Betting Rules

**BLIND PLAYER:**
- Min bet = currentStake (₨)
- Max bet = 2 × currentStake (₨)

**SEEN PLAYER:**
- Min bet = 2 × currentStake (₨)
- Max bet = 4 × currentStake (₨)

If blind player sees cards → becomes SEEN permanently

### Game Flow

1. Host creates room → other players join
2. Host starts game → 3 cards dealt to each player
3. Initial stake = ₨10
4. Players take turns betting/folding
5. Game ends when only 1 player remains (folds)
6. Winner receives entire pot (₨)

### Player Actions

- **fold** - Exit current round
- **see** - Change from blind to seen (can only be done once)
- **bet(amount)** - Place bet in NPR (₨)

## 🔌 Socket Events

### Client → Server (Emit)

```javascript
// Room Management
socket.emit('createRoom', { hostId, hostName, gameType }, callback)
socket.emit('joinRoom', { roomCode, playerId, username }, callback)
socket.emit('leaveRoom', { roomCode, playerId }, callback)
socket.emit('getRoomInfo', { roomCode }, callback)

// Game Actions
socket.emit('startGame', { roomCode, playerId }, callback)
socket.emit('playerAction', { roomCode, playerId, action }, callback)
socket.emit('getGameState', { roomCode, playerId }, callback)
```

### Server → Client (Listen)

```javascript
// Room Updates
socket.on('roomUpdate', (roomInfo) => {})
socket.on('playerJoined', (playerData) => {})
socket.on('playerDisconnected', (playerId) => {})

// Game Updates
socket.on('gameState', (gameState) => {})
socket.on('gameUpdate', (gameState) => {})
socket.on('turnUpdate', (turnData) => {})
socket.on('playerActionOccurred', (actionData) => {})
socket.on('gameFinished', (result) => {})
```

## 📊 Game State Object

```javascript
{
  roomId,                 // Unique room ID
  state,                  // 'waiting' | 'playing' | 'finished'
  roundNumber,            // Current round
  players: [              // Array of players
    {
      id,                 // Player ID
      name,               // Username
      coins,              // NPR wallet balance
      hand,               // [{ suit, rank }, ...] (only for own view)
      isBlind,            // Still blind?
      folded,             // Out of round?
      currentBet,         // Current bet in NPR
      seat                // Position 0-5
    }
  ],
  pot,                    // Total pot in NPR (₨)
  currentStake,           // Current stake in NPR (₨)
  currentTurnPlayerId,    // Who's turn is it?
  activePlayers,          // Array of active player IDs
  deck: {
    remaining             // Cards left in deck
  }
}
```

## 🔒 Security Features

- ✅ All bets validated on server
- ✅ Turn-based action enforcement
- ✅ Player coins checked before bets
- ✅ Client data never trusted
- ✅ All calculations server-side only
- ✅ Automatic disconnection handling

## 📁 File Structure

```
backend/
├── server.js              # Main server setup
├── socket.js              # Socket.IO event handlers
├── teenpatti.js           # Game logic & rules
├── players.js             # Player class
├── rooms.js               # Room management
├── deck.js                # Card deck system
├── package.json           # Dependencies
├── .env.example           # Configuration template
└── README.md              # This file
```

## 🚀 Example Usage

### Creating a Game Room

```javascript
// Client code
socket.emit('createRoom', {
  hostId: 'user123',
  hostName: 'Player One',
  gameType: 'teen-patti',
  maxPlayers: 6
}, (response) => {
  if (response.success) {
    console.log('Room created:', response.roomCode);
  }
});
```

### Joining a Room

```javascript
socket.emit('joinRoom', {
  roomCode: 'ABC123',
  playerId: 'user456',
  username: 'Player Two'
}, (response) => {
  if (response.success) {
    console.log('Joined room, assigned seat:', response.seat);
  }
});
```

### Starting a Game

```javascript
socket.emit('startGame', {
  roomCode: 'ABC123',
  playerId: 'user123' // Must be host
}, (response) => {
  if (response.success) {
    console.log('Game started!');
  }
});
```

### Placing a Bet

```javascript
socket.emit('playerAction', {
  roomCode: 'ABC123',
  playerId: 'user456',
  action: {
    type: 'bet',
    amount: 50  // ₨50
  }
}, (response) => {
  if (response.success) {
    console.log('Bet placed, pot now:', response.pot);
  }
});
```

## 🔄 Turn System

- Only one player acts at a time
- Turns rotate clockwise
- Folded players are skipped
- Game validates it's your turn before accepting action

## 🎯 Win Conditions

Game ends when:
1. Only 1 active player remains (others folded) → Player wins full pot
2. Future: SHOW logic (card comparison)

Winner receives: **Full pot amount in ₨**

## ⚙️ Configuration

Create `.env` file in backend directory:

```bash
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 🧪 Testing

Open multiple browser tabs/windows with the frontend URL:
- Each tab acts as independent player
- All synced via Socket.IO in real-time
- Test full multiplayer gameplay locally

## 📊 Admin Events (Development Only)

```javascript
// Get server statistics
socket.emit('adminGetStats', {}, (stats) => {
  console.log(stats);
  // { roomCount, playerCount, activeConnections }
});

// Reset server (clear all rooms)
socket.emit('adminResetServer', {}, (response) => {
  console.log('Server reset');
});
```

> ⚠️ Remove these events before production deployment!

## 🚨 Error Handling

All socket events return responses with `success` flag:

```javascript
{
  success: true/false,
  error?: 'Error message',
  data?: { ... }
}
```

## 📱 API Reference

### TeenPattiGame Class

```javascript
// Create game
const game = new TeenPattiGame(roomId, maxPlayers)

// Add player
game.addPlayer(player, seat)

// Start game
game.startGame()

// Process action
game.processAction(playerId, { type, amount })

// Get game state
game.getGameState(playerId)

// Get active player count
game.getActivePlayersCount()

// Check if finished
game.isGameFinished()
```

### Room Class

```javascript
// Create room
const room = new Room(hostId, hostName, gameType)

// Add player
room.addPlayer(playerId, socketId, username, initialCoins)

// Start game
room.startGame()

// Process action
room.processPlayerAction(playerId, action)

// Get room info
room.getRoomInfo()
```

## 🐛 Debugging

Enable debug logging:

```javascript
// In server.js
const DEBUG = true;
```

Check server console for:
- Connection/disconnection logs
- Room creation/deletion
- Player actions
- Game state changes

## 📈 Performance Notes

- Handles 100+ concurrent connections
- Low-latency turn-based gameplay
- Minimal memory footprint per room
- Automatic cleanup of empty rooms
- Efficient card shuffling (Fisher-Yates)

## 🔐 Production Checklist

- [ ] Remove admin events (adminResetServer, adminGetStats)
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL to production domain
- [ ] Enable HTTPS/WSS in production
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Add database persistence
- [ ] Implement player authentication
- [ ] Add game history logging

## 📞 Support

For issues or questions:
1. Check Socket.IO logs on server
2. Verify CORS configuration
3. Test with admin events
4. Check network connection

## 📜 License

MIT

---

**Built with ♠️ for Teen Patti players worldwide**
