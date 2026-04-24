# Backend Integration Guide

Complete guide to integrate the Teen Patti backend with your frontend.

## 🔗 Backend Server Setup

### 1. Install & Run Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run development server
npm run dev

# Server runs on: http://localhost:3001
```

You should see:
```
╔════════════════════════════════════════════════════╗
║   Teen Patti Multiplayer Game Backend              ║
║   Node.js + Socket.IO + NPR Currency              ║
╚════════════════════════════════════════════════════╝

🎮 Server running on: http://localhost:3001
```

## 📱 Frontend Socket Connection

### Update Socket Configuration

In [src/integrations/socket.ts](../src/integrations/socket.ts):

```typescript
const SOCKET_URL = process.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling']
});
```

### Environment Variables

Create or update `.env` in project root:

```env
VITE_SOCKET_URL=http://localhost:3001
```

For production:
```env
VITE_SOCKET_URL=https://your-backend.com
```

## 🎮 Using Socket Events

### Example: Create Teen Patti Room

```typescript
import { socket } from '@/integrations/socket';

// Create a new room
socket.emit('createRoom', {
  hostId: 'user123',
  hostName: 'Player One',
  gameType: 'teen-patti',
  maxPlayers: 6
}, (response) => {
  if (response.success) {
    const roomCode = response.roomCode;
    console.log('Room created:', roomCode);
    // Navigate to game
  } else {
    console.error('Error:', response.error);
  }
});
```

### Example: Join Room

```typescript
socket.emit('joinRoom', {
  roomCode: 'ABC123',
  playerId: 'user456',
  username: 'Player Two'
}, (response) => {
  if (response.success) {
    console.log('Joined room at seat:', response.seat);
  }
});
```

### Example: Start Game

```typescript
socket.emit('startGame', {
  roomCode: 'ABC123',
  playerId: 'user123' // Must be host
}, (response) => {
  if (response.success) {
    console.log('Game started!');
  }
});
```

### Example: Player Action (Bet)

```typescript
socket.emit('playerAction', {
  roomCode: 'ABC123',
  playerId: 'user456',
  action: {
    type: 'bet',
    amount: 50  // ₨50
  }
}, (response) => {
  if (response.success) {
    console.log('Action successful, pot:', response.pot);
  } else {
    console.error('Error:', response.error);
  }
});
```

### Example: Fold Action

```typescript
socket.emit('playerAction', {
  roomCode: 'ABC123',
  playerId: 'user456',
  action: {
    type: 'fold'
  }
}, (response) => {
  if (response.success) {
    console.log('Player folded');
  }
});
```

### Example: See Action

```typescript
socket.emit('playerAction', {
  roomCode: 'ABC123',
  playerId: 'user456',
  action: {
    type: 'see'
    // Only blind players can see (no amount needed)
  }
}, (response) => {
  if (response.success) {
    console.log('Player is now seen');
  }
});
```

## 📊 Listening to Server Events

### Room Updates

```typescript
socket.on('roomUpdate', (roomInfo) => {
  console.log('Room updated:', roomInfo);
  // Update UI with:
  // - roomInfo.playerCount
  // - roomInfo.players[]
  // - roomInfo.state
});

socket.on('playerJoined', (playerData) => {
  console.log('Player joined:', playerData.username);
});

socket.on('playerDisconnected', (data) => {
  console.log('Player disconnected:', data.playerId);
});
```

### Game State Updates

```typescript
socket.on('gameState', (gameState) => {
  console.log('Initial game state:', gameState);
  // Update with:
  // - gameState.yourCards[] - Your 3 cards
  // - gameState.players[] - All players
  // - gameState.pot - Current pot in ₨
  // - gameState.currentStake - Current stake in ₨
});

socket.on('gameUpdate', (gameState) => {
  console.log('Game updated:', gameState);
  // Similar to gameState, partial updates
});

socket.on('turnUpdate', (turnData) => {
  console.log('Turn update:', turnData);
  // Update with:
  // - turnData.currentPlayerId - Whose turn is it?
  // - turnData.currentStake - Current stake in ₨
});

socket.on('playerActionOccurred', (actionData) => {
  console.log('Action:', actionData);
  // Update with:
  // - actionData.playerId
  // - actionData.action - 'bet' | 'fold' | 'see'
  // - actionData.amount - Bet amount in ₨
  // - actionData.pot - Updated pot in ₨
});
```

### Game Completion

```typescript
socket.on('gameFinished', (result) => {
  console.log('Game finished!', result);
  // Update with:
  // - result.winner - Winning player ID
  // - result.pot - Final pot amount in ₨
  // - result.reason - Why game ended
});
```

## 💱 Currency Handling (NPR - ₨)

All values in backend are in **NPR (₨)**:
- 1 unit = ₨10
- Min bet = currentStake (₨)
- Max bet = 2x or 4x currentStake (₨) depending on blind/seen

### Display Currency

```typescript
// Format NPR for display
function formatNPR(amount: number): string {
  return `₨${amount.toLocaleString('en-IN')}`;
}

// Usage
console.log(formatNPR(1000)); // ₨1,000
console.log(formatNPR(50));   // ₨50
```

## 🔄 Game Flow in Components

### TeenPattiGame Component Integration

```typescript
import { socket } from '@/integrations/socket';

export function TeenPattiGame() {
  const [gameState, setGameState] = useState(null);
  const [roomCode] = useSearchParams(); // Get from URL

  useEffect(() => {
    // Request initial game state
    socket.emit('getGameState', {
      roomCode: roomCode,
      playerId: userState.playerId
    }, (response) => {
      if (response.success) {
        setGameState(response.gameState);
      }
    });

    // Listen for updates
    socket.on('gameUpdate', setGameState);
    socket.on('turnUpdate', (turnData) => {
      setGameState(prev => ({
        ...prev,
        currentTurnPlayerId: turnData.currentPlayerId,
        currentStake: turnData.currentStake
      }));
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('turnUpdate');
    };
  }, [roomCode]);

  // Handle player action
  const handleBet = (amount: number) => {
    socket.emit('playerAction', {
      roomCode,
      playerId: userState.playerId,
      action: { type: 'bet', amount }
    }, (response) => {
      if (!response.success) {
        alert(response.error);
      }
    });
  };

  const handleFold = () => {
    socket.emit('playerAction', {
      roomCode,
      playerId: userState.playerId,
      action: { type: 'fold' }
    });
  };

  const handleSee = () => {
    socket.emit('playerAction', {
      roomCode,
      playerId: userState.playerId,
      action: { type: 'see' }
    });
  };

  return (
    <div>
      {/* Game UI */}
      {/* Display gameState.pot, gameState.players, etc. */}
      {/* Buttons for handleBet, handleFold, handleSee */}
    </div>
  );
}
```

## 🧪 Testing

### Test Locally

1. **Terminal 1** - Start backend:
```bash
cd backend
npm run dev
```

2. **Terminal 2** - Start frontend:
```bash
npm run dev
```

3. **Browser** - Open multiple tabs:
   - Tab 1: `http://localhost:5173` - Player 1
   - Tab 2: `http://localhost:5173` - Player 2
   - Tab 3: `http://localhost:5173` - Player 3

4. **Test Flow**:
   - Player 1: Create room
   - Players 2-3: Join room
   - Player 1: Start game
   - All: Place bets, fold, etc.

### Admin Events (Testing)

```typescript
// Get server stats
socket.emit('adminGetStats', {}, (stats) => {
  console.log(stats);
  // { roomCount, playerCount, activeConnections }
});

// Reset server (clear all rooms)
socket.emit('adminResetServer', {}, (response) => {
  console.log('Server reset');
});
```

## 🐛 Troubleshooting

### Socket Connection Issues

**Problem**: Backend not connecting
- Check backend is running: `http://localhost:3001/health`
- Verify VITE_SOCKET_URL is correct
- Check CORS settings match frontend origin

**Problem**: CORS error
- Backend CORS is configured for `http://localhost:5173`
- For production, update `FRONTEND_URL` in backend `.env`

### Game Logic Issues

**Problem**: Invalid bet amount
- Check player is blind or seen
- Verify amount is within limits:
  - Blind: min = currentStake, max = 2x currentStake
  - Seen: min = 2x currentStake, max = 4x currentStake

**Problem**: Not your turn
- Verify `isYourTurn` in gameState
- Check `currentTurnPlayerId` matches your playerId

**Problem**: Insufficient coins
- Player coins must be >= bet amount
- Initial coins are ₨1000

## 📊 Backend Game State Example

```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "state": "playing",
  "roundNumber": 1,
  "players": [
    {
      "id": "user123",
      "name": "Player One",
      "coins": 950,
      "hand": [
        { "suit": "♠", "rank": "K" },
        { "suit": "♥", "rank": "Q" },
        { "suit": "♦", "rank": "J" }
      ],
      "isBlind": false,
      "folded": false,
      "currentBet": 50,
      "totalBetThisRound": 50,
      "seat": 0
    }
  ],
  "pot": 100,
  "currentStake": 25,
  "currentTurnPlayerId": "user456",
  "activePlayers": ["user123", "user456"],
  "yourCards": [
    { "suit": "♠", "rank": "K" },
    { "suit": "♥", "rank": "Q" },
    { "suit": "♦", "rank": "J" }
  ],
  "yourSeat": 0,
  "yourCoins": 950,
  "yourBet": 50,
  "isYourTurn": false
}
```

## 🔐 Security Notes

- All bets validated server-side
- Player cards hidden from other players
- Turn-based system prevents out-of-order actions
- Coin balance checked before bets
- No client-side bet calculation trusted

## 🚀 Production Deployment

### Backend Deployment

1. Build production image:
```bash
cd backend
npm install --production
npm start
```

2. Set environment variables:
```env
PORT=3001
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

3. Deploy to platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Configuration

Update `.env`:
```env
VITE_SOCKET_URL=https://your-backend-domain.com
```

## 📚 Related Files

- [Backend README](./backend/README.md) - Backend documentation
- [Socket Service](src/lib/socketService.ts) - Frontend socket service
- [Game Context](src/contexts/GameContext.tsx) - Game state management
- [Teen Patti Game Component](src/components/TeenPattiTable.tsx) - UI component

---

**Ready to play Teen Patti! 🎮♠️**
