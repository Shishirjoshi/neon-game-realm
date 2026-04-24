# Backend API Reference

Complete Socket.IO event documentation for Teen Patti backend.

## 📡 Socket Event Reference

### Room Management Events

---

#### `createRoom`

Create a new Teen Patti game room.

**Client Emit:**
```typescript
socket.emit('createRoom', {
  hostId: string;          // Unique player ID
  hostName: string;        // Display name
  gameType?: string;       // 'teen-patti' (default)
  maxPlayers?: number;     // 1-6 (default: 6)
}, callback)
```

**Server Response:**
```typescript
{
  success: boolean;
  error?: string;
  roomCode?: string;       // 6-character room code
  roomId?: string;         // UUID
  seat?: number;           // Host's seat (0)
}
```

**Example:**
```typescript
socket.emit('createRoom', {
  hostId: 'player_abc123',
  hostName: 'Rahul',
  gameType: 'teen-patti',
  maxPlayers: 6
}, (response) => {
  if (response.success) {
    console.log('Room:', response.roomCode); // e.g., "ABC123"
  }
});
```

---

#### `joinRoom`

Join an existing room by room code.

**Client Emit:**
```typescript
socket.emit('joinRoom', {
  roomCode: string;        // 6-character room code
  playerId: string;        // Unique player ID
  username: string;        // Display name
}, callback)
```

**Server Response:**
```typescript
{
  success: boolean;
  error?: string;
  roomCode?: string;
  roomId?: string;
  seat?: number;           // Assigned seat (0-5)
}
```

**Example:**
```typescript
socket.emit('joinRoom', {
  roomCode: 'ABC123',
  playerId: 'player_def456',
  username: 'Priya'
}, (response) => {
  if (response.success) {
    console.log('Joined at seat:', response.seat);
  }
});
```

---

#### `leaveRoom`

Leave the current room.

**Client Emit:**
```typescript
socket.emit('leaveRoom', {
  roomCode: string;        // Room code
  playerId: string;        // Player ID
}, callback)
```

**Server Response:**
```typescript
{
  success: boolean;
  error?: string;
}
```

---

#### `getRoomInfo`

Get current room information.

**Client Emit:**
```typescript
socket.emit('getRoomInfo', {
  roomCode: string;
}, callback)
```

**Server Response:**
```typescript
{
  success: boolean;
  error?: string;
  room?: {
    roomId: string;
    code: string;
    hostId: string;
    hostName: string;
    gameType: string;
    state: 'waiting' | 'playing' | 'finished';
    playerCount: number;
    maxPlayers: number;
    players: Array<{
      id: string;
      username: string;
      coins: number;         // In ₨
      isHost: boolean;
    }>;
    createdAt: Date;
  };
}
```

---

### Game Events

---

#### `startGame`

Start the game (host only).

**Client Emit:**
```typescript
socket.emit('startGame', {
  roomCode: string;
  playerId: string;        // Must be host
}, callback)
```

**Server Response:**
```typescript
{
  success: boolean;
  error?: string;
  gameState?: {
    roomId: string;
    state: 'playing';
    roundNumber: number;
    players: Player[];
    pot: number;            // In ₨
    currentStake: number;   // In ₨ (initially ₨10)
    currentTurnPlayerId: string;
    activePlayers: string[];
  };
}
```

---

#### `playerAction`

Perform a game action (bet, fold, see).

**Client Emit:**
```typescript
socket.emit('playerAction', {
  roomCode: string;
  playerId: string;
  action: {
    type: 'bet' | 'fold' | 'see';
    amount?: number;       // Required for 'bet', in ₨
  };
}, callback)
```

**Server Response:**
```typescript
{
  success: boolean;
  error?: string;
  limits?: {               // Returned if bet amount invalid
    min: number;           // Min bet in ₨
    max: number;           // Max bet in ₨
    multiplier: 'blind' | 'seen';
  };
  action?: string;         // The action performed
  pot?: number;            // Updated pot in ₨
  gameFinished?: boolean;
  winner?: string;         // If game finished
}
```

**Action Types:**

`bet` - Place a bet
```typescript
{
  type: 'bet',
  amount: 50  // ₨50
}
```

`fold` - Fold current hand
```typescript
{
  type: 'fold'
}
```

`see` - Change from blind to seen (blind players only)
```typescript
{
  type: 'see'
}
```

**Bet Limits:**
- Blind player: min = currentStake, max = 2 × currentStake
- Seen player: min = 2 × currentStake, max = 4 × currentStake

---

#### `getGameState`

Get current game state.

**Client Emit:**
```typescript
socket.emit('getGameState', {
  roomCode: string;
  playerId: string;
}, callback)
```

**Server Response:**
```typescript
{
  success: boolean;
  error?: string;
  gameState?: {
    roomId: string;
    state: 'waiting' | 'playing' | 'finished';
    roundNumber: number;
    players: Array<{
      id: string;
      name: string;
      coins: number;           // In ₨
      hand: Card[];            // Only for your view
      isBlind: boolean;
      folded: boolean;
      currentBet: number;      // In ₨
      totalBetThisRound: number;
      seat: 0-5;
    }>;
    pot: number;               // In ₨
    currentStake: number;      // In ₨
    currentTurnPlayerId: string;
    activePlayers: string[];
    yourCards: Card[];
    yourSeat: number;
    yourCoins: number;         // In ₨
    yourBet: number;           // In ₨
    isYourTurn: boolean;
    deck: { remaining: number };
  };
}
```

---

### Server → Client Events

These events are emitted by the server to connected clients.

---

#### `roomUpdate`

Fired when room state changes (players joined/left, etc).

**Listen:**
```typescript
socket.on('roomUpdate', (roomInfo) => {
  // roomInfo structure same as getRoomInfo response
});
```

---

#### `playerJoined`

Fired when a new player joins the room.

**Listen:**
```typescript
socket.on('playerJoined', (playerData) => {
  // playerData: { id, username, coins, isHost }
});
```

---

#### `playerDisconnected`

Fired when a player disconnects.

**Listen:**
```typescript
socket.on('playerDisconnected', (data) => {
  // data: { playerId }
});
```

---

#### `gameState`

Sent when game starts, contains initial game state for the player.

**Listen:**
```typescript
socket.on('gameState', (gameState) => {
  // Full game state object
});
```

---

#### `gameUpdate`

Fired when game state changes (after actions).

**Listen:**
```typescript
socket.on('gameUpdate', (gameState) => {
  // Partial or full game state update
});
```

---

#### `turnUpdate`

Fired when it's a different player's turn.

**Listen:**
```typescript
socket.on('turnUpdate', (turnData) => {
  // {
  //   currentPlayerId: string;
  //   currentStake: number;  // In ₨
  // }
});
```

---

#### `playerActionOccurred`

Fired when any player performs an action.

**Listen:**
```typescript
socket.on('playerActionOccurred', (actionData) => {
  // {
  //   playerId: string;
  //   action: 'bet' | 'fold' | 'see';
  //   amount?: number;       // In ₨
  //   pot: number;           // In ₨
  //   currentStake: number;  // In ₨
  // }
});
```

---

#### `gameFinished`

Fired when game ends.

**Listen:**
```typescript
socket.on('gameFinished', (result) => {
  // {
  //   winner: string;        // Player ID
  //   pot: number;           // In ₨
  //   reason: string;        // e.g., "All players folded except one"
  // }
});
```

---

### Admin Events (Development/Testing)

---

#### `adminGetStats`

Get server statistics (development only).

**Client Emit:**
```typescript
socket.emit('adminGetStats', {}, (stats) => {
  // {
  //   roomCount: number;
  //   playerCount: number;
  //   activeConnections: number;
  // }
});
```

---

#### `adminResetServer`

Reset entire server state (development only).

**Client Emit:**
```typescript
socket.emit('adminResetServer', {}, (response) => {
  // { success: true }
});
```

> ⚠️ **REMOVE BEFORE PRODUCTION**

---

## 📊 Data Types

### Player Object

```typescript
{
  id: string;                    // Unique player ID
  name: string;                  // Username
  coins: number;                 // Wallet in ₨
  hand: Card[];                  // 3 cards (hidden from others)
  isBlind: boolean;              // Blind or seen
  folded: boolean;               // Out of round?
  currentBet: number;            // Current bet in ₨
  totalBetThisRound: number;     // Total bet this round in ₨
  isActive: boolean;             // Still playing?
  seat: 0 | 1 | 2 | 3 | 4 | 5;  // Table position
}
```

### Card Object

```typescript
{
  suit: '♠' | '♥' | '♦' | '♣';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
}
```

### Room Object

```typescript
{
  roomId: string;              // UUID
  code: string;                // 6-char code (e.g., "ABC123")
  hostId: string;              // Host player ID
  hostName: string;            // Host username
  gameType: string;            // 'teen-patti'
  maxPlayers: number;          // 2-6
  state: 'waiting' | 'playing' | 'finished';
  playerCount: number;
  players: Array<{
    id: string;
    username: string;
    coins: number;             // In ₨
    isHost: boolean;
  }>;
  createdAt: Date;
}
```

---

## 💱 Currency Notes

All amounts are in **NPR (₨)**:

- 1 unit = ₨10
- Initial stake = ₨10
- Initial player coins = ₨1000
- Min bet = currentStake
- Max bet = currentStake × 2 (blind) or currentStake × 4 (seen)

---

## 🔒 Security Rules

- ✅ All bets validated server-side
- ✅ Turn-based actions enforced
- ✅ Player coins verified before deduction
- ✅ Cards hidden from other players
- ✅ Only host can start game
- ✅ Automatic disconnection handling

---

## 📋 Error Codes

All failed responses include:
```typescript
{
  success: false;
  error: string;  // Human-readable error message
}
```

Common errors:
- `"Room not found"` - Invalid room code
- `"Player not found"` - Invalid player ID
- `"Room is full"` - Cannot add more players
- `"Not your turn"` - Player tried to act out of turn
- `"Invalid bet amount"` - Bet outside limits
- `"Insufficient coins"` - Not enough coins for bet
- `"Only host can start game"` - Non-host tried to start
- `"Minimum 2 players required"` - Not enough players to start

---

## 🧪 Example: Complete Game Flow

```typescript
// 1. Player 1 creates room
socket.emit('createRoom', {
  hostId: 'p1',
  hostName: 'Rahul'
}, (res) => {
  const roomCode = res.roomCode; // "ABC123"
  
  // 2. Player 2 joins
  socket2.emit('joinRoom', {
    roomCode,
    playerId: 'p2',
    username: 'Priya'
  }, (res2) => {
    
    // 3. Host starts game
    socket.emit('startGame', {
      roomCode,
      playerId: 'p1'
    }, (res3) => {
      
      // 4. Listen for turns
      socket.on('turnUpdate', (turn) => {
        if (turn.currentPlayerId === 'p1') {
          // Player 1's turn, place bet
          socket.emit('playerAction', {
            roomCode,
            playerId: 'p1',
            action: { type: 'bet', amount: 50 }
          });
        }
      });
      
      // 5. Listen for game finish
      socket.on('gameFinished', (result) => {
        console.log(`${result.winner} won ₨${result.pot}!`);
      });
    });
  });
});
```

---

## 🚀 Next Steps

1. Integrate with your frontend
2. Test with multiple clients
3. Deploy backend to production
4. Monitor server logs
5. Add database persistence
6. Implement authentication

---

**Built for real-time Teen Patti gaming 🎮♠️**
