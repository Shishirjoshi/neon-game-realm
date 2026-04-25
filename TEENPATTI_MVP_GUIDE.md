# Teen Patti MVP - Complete Integration Guide

## Overview

This is a **simplified Teen Patti multiplayer game** with:
- ✅ Real-time multiplayer (2-6 players)
- ✅ Room-based system
- ✅ Turn-based betting (₨10 fixed bet)
- ✅ Proper hand ranking
- ✅ Winner calculation
- ✅ Socket.IO real-time updates

---

## Project Structure

### Backend Files

```
backend/
├── gameLogic.js          # Core game mechanics (hand ranking, card dealing)
├── gameManager.js        # Room and game state management
├── socketHandlers.js     # Socket.IO event handlers
└── server-mvp.js         # Express + Socket.IO server
```

### Frontend Files

```
src/
└── integrations/
    └── teenpatti-client.js   # Socket.IO client wrapper
```

---

## File Descriptions

### 1. **gameLogic.js**
Core game mechanics and utilities.

**Exports:**
- `createDeck()` - Returns a 52-card deck
- `shuffleDeck(deck)` - Fisher-Yates shuffle algorithm
- `dealCards(players)` - Deals 3 cards to each player
- `evaluateHand(hand)` - Returns hand type and rank
- `compareHands(hand1, hand2)` - Compares two hands, returns winner
- `determineWinner(players)` - Finds overall winner
- `getNextActivePlayer(players, currentIndex)` - Gets next non-folded player
- `getRankValue(rank)` - Converts rank to numeric value
- `formatCurrency(amount)` - Formats number as NPR currency

**Hand Rankings (Best to Worst):**
1. **Trio** - Three of a kind (rank: 5)
2. **Sequence** - Three consecutive cards (rank: 4)
3. **Color** - All three cards same suit (rank: 3)
4. **Pair** - Two cards of same rank (rank: 2)
5. **High Card** - Highest card wins (rank: 1)

---

### 2. **gameManager.js**
Manages all game state, rooms, and players.

**Class: GameManager**

**Methods:**

```javascript
// Room Management
createRoom(hostId, hostName, roomName)  // Returns room object
joinRoom(roomId, socketId, playerId, playerName)  // Returns result
getRoom(roomId)  // Returns room or null
getAllRooms()  // Returns array of all rooms
deleteRoom(roomId)  // Deletes room

// Game Actions
startGame(roomId)  // Deals cards, starts game
playerBet(roomId, playerId, amount = 10)  // Player bets
playerFold(roomId, playerId)  // Player folds
endGame(roomId)  // Determines winner, awards pot
resetGame(roomId)  // Resets for next round

// Helper
leaveRoom(roomId, playerId)  // Player leaves
```

**Room Object:**
```javascript
{
  roomId,           // UUID
  roomName,         // String
  hostId,           // Host socket ID
  players: [        // Array of players
    {
      id,           // Player ID (socket ID or custom)
      name,         // Player name
      coins: 1000,  // Current balance
      hand: [],     // Array of 3 cards
      folded: false,// Has player folded?
      currentBet: 0,// Current bet in this turn
      socketId      // Socket ID
    }
  ],
  pot: 0,           // Total pot (NPR)
  currentTurnIndex: 0,  // Index of current player
  state: "waiting", // "waiting" | "playing" | "finished"
  maxPlayers: 6,    // Max players in room
  createdAt         // Timestamp
}
```

---

### 3. **socketHandlers.js**
All Socket.IO event handlers.

**Incoming Events (Client → Server):**

```javascript
// Room Management
createRoom(data)      // { hostName, roomName }
joinRoom(data)        // { roomId, playerName, playerId }
getRoom(data)         // { roomId }
getAllRooms()         // No payload
leaveRoom(data)       // { roomId, playerId }

// Game Control
startGame(data)       // { roomId } - Host only
resetGame(data)       // { roomId }

// Game Actions
playerBet(data)       // { roomId, playerId, amount = 10 }
playerFold(data)      // { roomId, playerId }
finishBettingRound(data)  // { roomId }
```

**Outgoing Events (Server → Client):**

```javascript
// Broadcasts
roomCreated           // New room created
roomUpdate            // Room state changed
gameStarted           // Game started, cards dealt
gameUpdate            // Player action occurred
gameEnd               // Game finished, winner determined
gameReset             // New round started
```

---

### 4. **server-mvp.js**
Express + Socket.IO server.

**API Endpoints:**

```
GET  /health                 # Health check
GET  /api/rooms              # Get all rooms
GET  /api/rooms/:roomId      # Get specific room details
GET  /api/stats              # Get game statistics
```

**Starting Server:**
```bash
npm install
node backend/server-mvp.js
```

Server runs on **port 3001** by default (set `PORT` env var to change).

---

### 5. **teenpatti-client.js**
Frontend Socket.IO client wrapper for React.

**Usage:**

```javascript
import TeenPattiClient from '@/integrations/teenpatti-client';

const client = new TeenPattiClient('http://localhost:3001');

// Connect
await client.connect();

// Create Room
const room = await client.createRoom('Alice', 'My Room');

// Join Room
const updatedRoom = await client.joinRoom(roomId, 'Bob', playerId);

// Listen to Events
client.on('gameStarted', (data) => {
  console.log('Game started!', data);
});

client.on('gameUpdate', (data) => {
  console.log('Player action:', data.action);
});

client.on('gameEnd', (data) => {
  console.log('Winner:', data.winner.name);
});

// Player Actions
await client.bet(roomId, playerId, 10);
await client.fold(roomId, playerId);

// Start Game (host only)
await client.startGame(roomId);

// Disconnect
client.disconnect();
```

---

## Game Flow

### 1. **Room Creation**
```
Host creates room
  ↓
Room created with host as only player
```

### 2. **Players Join**
```
Players join room
  ↓
Room displays all players
```

### 3. **Game Start**
```
Host clicks "Start Game"
  ↓
Server deals 3 cards to each player
  ↓
Game state → "playing"
  ↓
Turn index → 0 (first player's turn)
```

### 4. **Betting Round**
```
Current player can:
  a) BET ₨10
     - Coins -= 10
     - Pot += 10
     - Turn → Next player
  
  b) FOLD
     - Folded = true
     - Turn → Next player
     - If only 1 player left → Winner!

Repeat until:
  - Only 1 player remains (auto win)
  - OR all players have acted once
```

### 5. **Game End**
```
Server compares all non-folded hands
  ↓
Winner = best hand
  ↓
Winner coins += pot
  ↓
State → "finished"
```

### 6. **Next Round (Optional)**
```
Host clicks "New Game"
  ↓
Game resets
  ↓
New cards dealt
```

---

## Currency System

- **Currency:** Nepalese Rupees (NPR) - ₨
- **Starting Coins:** ₨1000 per player
- **Fixed Bet:** ₨10 per turn
- **Display Format:** `formatCurrency(amount)` → "₨1,000"

---

## Error Handling

All socket callbacks return error responses:

```javascript
{
  success: false,
  error: "Error message"
}
```

**Common Errors:**
- "Room not found"
- "Player not found"
- "Room is full"
- "Not your turn"
- "Insufficient coins"
- "Only host can start game"

---

## Frontend Integration Example (React)

```jsx
import { useEffect, useState } from 'react';
import TeenPattiClient from '@/integrations/teenpatti-client';

export default function TeenPattiGame() {
  const [client, setClient] = useState(null);
  const [room, setRoom] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    // Initialize client
    const newClient = new TeenPattiClient('http://localhost:3001');
    newClient.connect().then(() => {
      setClient(newClient);
    });

    return () => {
      newClient?.disconnect();
    };
  }, []);

  // Listen to game events
  useEffect(() => {
    if (!client) return;

    client.on('roomUpdate', (data) => {
      setRoom(data.room);
    });

    client.on('gameStarted', (data) => {
      setRoom(data.room);
    });

    client.on('gameUpdate', (data) => {
      setRoom(data.room);
      setCurrentPlayer(data.currentPlayerTurn);
    });

    client.on('gameEnd', (data) => {
      console.log('Winner:', data.winner);
      setRoom(null);
    });

    return () => {
      client.removeAllListeners();
    };
  }, [client]);

  const handleBet = async () => {
    await client.bet(room.roomId, currentPlayer.id, 10);
  };

  const handleFold = async () => {
    await client.fold(room.roomId, currentPlayer.id);
  };

  return (
    <div>
      {room ? (
        <>
          <h1>Teen Patti Game</h1>
          <p>Pot: ₨{room.pot}</p>
          <p>Current Turn: {room.players[room.currentTurnIndex].name}</p>

          <div>
            {room.players.map((player) => (
              <div key={player.id}>
                <p>{player.name}</p>
                <p>₨{player.coins}</p>
                {player.folded && <p>Folded</p>}
              </div>
            ))}
          </div>

          <button onClick={handleBet}>Bet ₨10</button>
          <button onClick={handleFold}>Fold</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
```

---

## Environment Variables

Create a `.env` file in the backend root:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## Testing

### Test Room Creation
```bash
curl http://localhost:3001/api/rooms
```

### Test Game Statistics
```bash
curl http://localhost:3001/api/stats
```

---

## Dependencies

**Backend:**
```json
{
  "express": "^4.18.0",
  "socket.io": "^4.5.0",
  "cors": "^2.8.5",
  "uuid": "^9.0.0",
  "dotenv": "^16.0.0"
}
```

**Frontend:**
```json
{
  "socket.io-client": "^4.5.0",
  "react": "^18.0.0"
}
```

---

## Next Steps (Future Enhancements)

- [ ] Blind/Seen betting system
- [ ] Show/Compromise system
- [ ] Multiplayer betting rounds
- [ ] Player profiles and statistics
- [ ] Leaderboards
- [ ] Authentication system
- [ ] Payment integration
- [ ] Admin panel

---

## Support

For issues or questions, check:
1. Server logs for socket events
2. Browser console for client errors
3. Socket connection status (`client.socket.connected`)

---

**Version:** 1.0.0  
**Last Updated:** April 25, 2026
