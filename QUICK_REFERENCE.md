# Quick Reference Guide

## 🎯 What's Been Built

### 1. Socket.IO Real-Time System ✅
- **Socket Connection Management** (`src/integrations/socket.ts`)
  - Auto-reconnection on disconnect
  - Connection pooling and state management

- **Socket Context Provider** (`src/contexts/SocketContext.tsx`)
  - Global socket availability via `useSocket()` hook
  - Connected state tracking
  - Automatic cleanup on unmount

### 2. Game State Management ✅
- **Game Context** (`src/contexts/GameContext.tsx`)
  - Teen Patti state: players, pot, cards, game phase
  - Typing Race state: leaderboard, WPM, accuracy, progress
  - Global room information
  - Type-safe state updates

### 3. Teen Patti Poker Game ✅
- **Component** (`src/components/TeenPattiTable.tsx`)
  - 🪑 Circular player layout (up to 6 players)
  - 🎴 Card display (hand + community)
  - 💰 Pot visualization with glow effects
  - ⚙️ Game controls: Fold, Call, Raise (slider), Show
  - ✨ Card animations and dealing effects
  - 🔴 Player turn highlights
  - 📊 Live coin balance display
  - 🎭 Player status indicators (playing, folded, won)

- **Game Page** (`src/pages/TeenPattiGame.tsx`)
  - Socket integration
  - Game state synchronization
  - Action handling

### 4. Typing Race Game ✅
- **Component** (`src/components/TypingRaceGame.tsx`)
  - 📝 Real-time text display with character highlighting
  - ✅ Green/red character feedback
  - 🏆 Live leaderboard with ranking
  - 📈 Real-time WPM & accuracy metrics
  - ⏱️ Timer display
  - 📊 Progress bar
  - 🎉 Game completion screen
  - 🔄 Smooth leaderboard animations

- **Game Page** (`src/pages/TypingRaceGamePage.tsx`)
  - Socket integration
  - Typing progress tracking
  - Leaderboard synchronization

### 5. Playing Card Component ✅
- **Card UI** (`src/components/PlayingCard.tsx`)
  - Realistic card design
  - Face-up/face-down states
  - Dealing animation
  - Selection states
  - Hover effects

### 6. Socket Service Layer ✅
- **Socket Service** (`src/lib/socketService.ts`)
  - Event emitter setup
  - Event listener setup
  - Type-safe event handling

- **Custom Hooks** (`src/hooks/useSocket.ts`)
  - `useSocketEmit()` - Emit events
  - `useSocketListener()` - Listen to events
  - `useSocketEvents()` - Batch listener setup
  - `useSocketEmitters()` - Get all emitters

### 7. Documentation ✅
- **README.md** - Project overview & quick start
- **IMPLEMENTATION_GUIDE.md** - Architecture & development
- **BACKEND_SETUP.md** - Socket.IO server guide
- **.env.example** - Configuration template

## 📚 Usage Examples

### Using Socket.IO Hooks

```tsx
// Import the hooks
import { useSocket, useSocketListener, useSocketEmit } from '@/hooks/useSocket';

// In your component
function MyComponent() {
  const { socket, connected } = useSocket();
  const emit = useSocketEmit();

  // Listen to events
  useSocketListener('gameUpdate', (data) => {
    console.log('Game updated:', data);
  });

  // Emit events
  const handleJoinGame = () => {
    emit('joinGame', {
      roomCode: 'ABC123',
      userId: 'user1',
      gameType: 'teen-patti',
      username: 'Player1'
    });
  };

  return (
    <button onClick={handleJoinGame} disabled={!connected}>
      Join Game
    </button>
  );
}
```

### Using Game State

```tsx
import { useGameState } from '@/contexts/GameContext';

function GameComponent() {
  const { gameState, updateGameState, updatePlayer } = useGameState();

  // Update entire game state
  updateGameState({
    pot: 500,
    currentPlayerTurn: 'user2'
  });

  // Update specific player
  updatePlayer('user1', {
    coinBalance: 950,
    status: 'playing'
  });

  return (
    <div>
      <h2>{gameState?.gamePhase}</h2>
    </div>
  );
}
```

### Teen Patti Game

```tsx
import { TeenPattiTable } from '@/components/TeenPattiTable';

function GameRoom() {
  const handleAction = (action, amount) => {
    // Send to backend via Socket
    socket.emit('gameAction', {
      action,
      amount,
      // ...
    });
  };

  return (
    <TeenPattiTable
      gameState={gameState}
      currentUserId={user.id}
      onAction={handleAction}
    />
  );
}
```

### Typing Race Game

```tsx
import { TypingRaceGame } from '@/components/TypingRaceGame';

function TypingRoom() {
  const handleTyping = (text, wpm, accuracy) => {
    // Send updates to backend
    socket.emit('typingUpdate', {
      text,
      wpm,
      accuracy,
      progress: text.length / totalLength,
      // ...
    });
  };

  return (
    <TypingRaceGame
      gameState={gameState}
      currentUserId={user.id}
      onTyping={handleTyping}
    />
  );
}
```

## 🔌 Socket.IO Events Reference

### Emit (Client → Server)

```typescript
// Join game
socket.emit('joinGame', {
  roomCode: string;
  userId: string;
  gameType: 'teen-patti' | 'typing';
  username: string;
});

// Teen Patti action
socket.emit('gameAction', {
  roomCode: string;
  userId: string;
  action: 'fold' | 'call' | 'raise' | 'show';
  amount: number;
});

// Typing update
socket.emit('typingUpdate', {
  roomCode: string;
  userId: string;
  text: string;
  wpm: number;
  accuracy: number;
  progress: number;
});

// Leave game
socket.emit('leaveGame', {
  roomCode: string;
  userId: string;
});

// Start game (host only)
socket.emit('startGame', {
  roomCode: string;
  hostId: string;
});
```

### Listen (Server → Client)

```typescript
// Initial game state
socket.on('gameState', (state) => {
  // TeenPattiGameState | TypingGameState
});

// Game state updates
socket.on('gameUpdate', (update) => {
  // Partial state
});

// Player events
socket.on('playerJoined', (data) => {
  // { userId, username, seat }
});

socket.on('playerLeft', (data) => {
  // { userId }
});

// Player action (Teen Patti)
socket.on('playerAction', (data) => {
  // { playerId, action, amount }
});

// Leaderboard update (Typing)
socket.on('leaderboardUpdate', (leaderboard) => {
  // Array of leaderboard entries
});

// Errors
socket.on('error', (message) => {
  // Error string
});
```

## 🎨 Component Props

### TeenPattiTable
```typescript
interface TeenPattiTableProps {
  gameState: TeenPattiGameState;
  currentUserId: string;
  onAction: (action: 'fold' | 'call' | 'raise' | 'show', amount?: number) => void;
}
```

### TypingRaceGame
```typescript
interface TypingGameProps {
  gameState: TypingGameState;
  currentUserId: string;
  onTyping: (text: string, wpm: number, accuracy: number) => void;
}
```

### PlayingCard
```typescript
interface PlayingCardProps {
  suit?: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank?: 'A' | '2' | ... | 'K';
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  animated?: boolean;
  dealAnimation?: boolean;
}
```

## 📁 File Organization

### Components (`src/components/`)
- `TeenPattiTable.tsx` - Main poker game UI
- `TypingRaceGame.tsx` - Main typing game UI
- `PlayingCard.tsx` - Card component with animations
- `PlayerAvatar.tsx` - Player profile picture
- `GameCard.tsx` - Game listing card
- `NeonButton.tsx` - Styled button
- `GlassPanel.tsx` - Glassmorphism container
- `Navbar.tsx` - Navigation

### Contexts (`src/contexts/`)
- `SocketContext.tsx` - Socket.IO management
- `GameContext.tsx` - Game state management

### Hooks (`src/hooks/`)
- `useSocket.ts` - Socket.IO utilities
- `useAuth.ts` - Authentication state
- `use-toast.ts` - Toast notifications
- `use-mobile.tsx` - Mobile detection

### Pages (`src/pages/`)
- `Index.tsx` - Home/game hub
- `Auth.tsx` - Login/signup
- `Lobby.tsx` - Room creation
- `Room.tsx` - Waiting lobby
- `TeenPattiGame.tsx` - Poker game
- `TypingRaceGamePage.tsx` - Typing game
- `GamePlaceholder.tsx` - Placeholder

### Lib (`src/lib/`)
- `socketService.ts` - Socket event handlers
- `rooms.ts` - Room management
- `utils.ts` - Utility functions

## 🚀 Getting Started

### 1. Setup Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Backend Server
```bash
# In separate terminal
cd game-server
npm run dev
```

### 4. Start Frontend
```bash
npm run dev
```

### 5. Test Multiplayer
Open multiple browser tabs at `http://localhost:5173`

## 🔧 Customization

### Change Game Settings
Edit `src/data/games.ts` to add/remove/modify games

### Customize UI Colors
Edit `tailwind.config.ts` for theme colors

### Add New Socket Events
1. Add to `SocketEmitters`/`SocketListeners` in `socketService.ts`
2. Handle in backend server
3. Listen in components with `useSocketListener()`

## 💾 State Flow Diagram

```
Frontend Components
        ↓
useSocket() / useGameState()
        ↓
Socket.IO Events
        ↓
Backend Server (Node.js)
        ↓
Game Logic & Database
        ↓
Broadcast to all clients
        ↓
Update GameContext/UI
```

## 📞 Support

For issues or questions:
1. Check `IMPLEMENTATION_GUIDE.md`
2. Review `BACKEND_SETUP.md`
3. See Socket.IO documentation: https://socket.io/docs/
4. Check React/TypeScript docs

---

**Happy building! 🚀**
