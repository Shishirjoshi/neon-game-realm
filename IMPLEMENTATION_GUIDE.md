# Multiplayer Gaming Platform - Implementation Guide

## Architecture Overview

### Real-Time Communication
The platform uses **Socket.IO** for real-time multiplayer functionality:
- `SocketContext` manages socket connection and availability across the app
- `GameContext` maintains current game state and player information
- Custom hooks (`useSocket`, `useSocketListener`, `useSocketEmit`) simplify socket integration

### Game State Management
Two main contexts work together:
1. **SocketContext** - Handles WebSocket connection lifecycle
2. **GameContext** - Stores game state (players, game phase, cards, etc.)

### Component Hierarchy

```
App
├── SocketProvider
│   └── GameProvider
│       ├── Index (Home with game cards)
│       ├── Lobby (Create/Join room)
│       ├── Room (Waiting lobby)
│       ├── TeenPattiGame (Poker table UI)
│       └── TypingRaceGame (Typing game)
```

## Socket.IO Events

### Emitted Events (Client → Server)

#### Room Management
- `joinGame` - Join a game room
  ```typescript
  { roomCode, userId, gameType, username }
  ```
- `leaveGame` - Leave the game
  ```typescript
  { roomCode, userId }
  ```
- `startGame` - Start the game (host only)
  ```typescript
  { roomCode, hostId }
  ```

#### Teen Patti Events
- `gameAction` - Fold, call, raise, or show
  ```typescript
  { roomCode, userId, action, amount }
  ```

#### Typing Race Events
- `typingUpdate` - Send typing progress
  ```typescript
  { roomCode, userId, text, wpm, accuracy, progress }
  ```

### Listened Events (Server → Client)

#### Game State
- `gameState` - Initial game state on join
  ```typescript
  {
    type: 'teen-patti' | 'typing',
    players: GamePlayer[],
    gamePhase: string,
    ...gameSpecificState
  }
  ```
- `gameUpdate` - Partial state updates
- `gameStarted` - Game has started

#### Player Events
- `playerJoined` - New player joined
- `playerLeft` - Player disconnected
- `playerAction` - Another player took action

#### Game-Specific
- `leaderboardUpdate` (Typing) - Leaderboard changed
- `roomUpdated` - Room info changed

## File Structure

```
src/
├── components/
│   ├── TeenPattiTable.tsx      # Poker table UI with circular layout
│   ├── TypingRaceGame.tsx      # Typing game UI with leaderboard
│   └── PlayingCard.tsx         # Card component with animations
├── contexts/
│   ├── SocketContext.tsx       # Socket.IO connection management
│   └── GameContext.tsx         # Game state management
├── hooks/
│   └── useSocket.ts            # Socket.IO custom hooks
├── lib/
│   ├── socketService.ts        # Socket event emitters/listeners
│   └── rooms.ts                # Room creation helpers
├── pages/
│   ├── TeenPattiGame.tsx       # Teen Patti game page
│   ├── TypingRaceGamePage.tsx  # Typing race game page
│   └── Lobby.tsx               # Room lobby
└── integrations/
    └── socket.ts               # Socket.IO initialization
```

## Game Features

### Teen Patti (Poker)
- **UI**: Circular table layout with up to 6 players
- **Card Display**: Player hand (face down), community cards
- **Controls**: Fold, Call, Raise (with slider), Show
- **Animations**: Card dealing, player turn highlights, pot updates
- **Real-time**: Live player status, balance updates

### Typing Race
- **UI**: Centered text with character highlighting
- **Leaderboard**: Real-time WPM and accuracy tracking
- **Feedback**: Correct (green) / Wrong (red) characters
- **Metrics**: WPM, Accuracy, Progress bar
- **Animations**: Smooth leaderboard updates, game complete screen

## Setting Up

### 1. Install Dependencies
```bash
npm install socket.io-client
```

### 2. Configure Environment
Create `.env` with:
```
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Backend Requirements
Your Socket.IO server should:
- Accept `joinGame` events with player/room info
- Emit `gameState` with initial state
- Listen for `gameAction` (Teen Patti) / `typingUpdate` (Typing)
- Broadcast `gameUpdate` and game-specific events to all players
- Handle disconnections and room cleanup

### 4. Run Development Server
```bash
npm run dev
```

## Socket.IO Backend Example (Node.js)

```typescript
import { Server } from 'socket.io';

const io = new Server(3001, {
  cors: { origin: 'http://localhost:5173' }
});

io.on('connection', (socket) => {
  // Join game room
  socket.on('joinGame', ({ roomCode, userId, gameType, username }) => {
    socket.join(`room:${roomCode}`);
    
    // Send initial game state
    socket.emit('gameState', {
      type: gameType,
      players: [...], // Get from database
      pot: 0,
      yourCards: [],
      // ... game-specific state
    });
    
    // Notify others
    socket.to(`room:${roomCode}`).emit('playerJoined', {
      userId, username, seat: 0
    });
  });

  // Handle player actions
  socket.on('gameAction', ({ roomCode, userId, action, amount }) => {
    // Process action, update game state
    io.to(`room:${roomCode}`).emit('gameUpdate', {
      currentPlayerTurn: nextPlayerId,
      pot: newPot,
      // ...
    });
  });

  // Handle typing updates
  socket.on('typingUpdate', ({ roomCode, userId, wpm, accuracy, progress }) => {
    // Update player progress
    io.to(`room:${roomCode}`).emit('leaderboardUpdate', [
      { userId, wpm, accuracy, progress, ... }
    ]);
  });

  socket.on('disconnect', () => {
    // Handle player leaving
  });
});
```

## Styling & Theme

### Color Palette (Tailwind)
- **Primary**: Blue (#3b82f6)
- **Accent**: Cyan (#06b6d4)
- **Background**: Dark gradient
- **Neon**: Glowing effects on hover/active

### Components Use
- **GlassPanel**: Glassmorphism cards
- **NeonButton**: Glowing buttons
- **Framer Motion**: Smooth animations
- **Tailwind**: Responsive layout

## Performance Optimization

1. **Socket.IO**: Uses `socket.io-client` with auto-reconnection
2. **React Optimization**: 
   - Memoized selectors in contexts
   - Conditional renders for game types
   - Lazy loaded game pages
3. **Animations**: Hardware-accelerated transforms

## Error Handling

- Socket errors caught and displayed
- Network disconnection recovery via auto-reconnect
- Fallback UI for loading states
- Error toast notifications

## Testing

To test locally:
1. Start backend Socket.IO server on :3001
2. Run frontend: `npm run dev`
3. Open multiple tabs/windows
4. Join same room code in multiple tabs
5. Observe real-time updates

## Future Enhancements

- [ ] Spectator mode
- [ ] Chat in-game
- [ ] Replay system
- [ ] Tournament mode
- [ ] Mobile optimization
- [ ] Voice chat integration
- [ ] Match history/stats
- [ ] Cosmetic rewards system
