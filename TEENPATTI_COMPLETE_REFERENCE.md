# Teen Patti Complete Implementation - Quick Reference

## 📦 Project Contents

### Backend Files (Node.js)

1. **gameLogic.js** - Core game mechanics
   - Card deck creation/shuffling
   - Hand evaluation & ranking
   - Winner determination
   - Utility functions

2. **gameManager.js** - Game state management
   - Room creation/joining
   - Player management
   - Game flow control
   - Turn management

3. **botService.js** - AI bot logic
   - Bot decision making
   - Difficulty levels (Easy/Medium/Hard)
   - Personality traits
   - Hand strength evaluation

4. **socketHandlers.js** - Real-time events
   - 15+ socket.io events
   - Player actions (bet/fold)
   - Game updates & broadcasts
   - Error handling

5. **server-mvp.js** - Express + Socket.IO server
   - REST API endpoints
   - Server initialization
   - CORS configuration

### Frontend Files (React/TypeScript)

1. **TeenPattiHub.tsx** - Game mode selector
   - Beautiful UI with gradient backgrounds
   - Choose Online or Offline mode
   - Feature comparison cards

2. **TeenPattiMVP.tsx** - Online multiplayer
   - Room creation/joining
   - Real-time multiplayer gameplay
   - Socket.IO integration
   - Live betting & folding

3. **TeenPattiOffline.tsx** - Offline bot mode
   - Play against AI bots
   - Difficulty selection
   - Full game loop
   - No internet required

4. **teenpatti-client.js** - Socket client wrapper
   - Promise-based API
   - Event listeners
   - Auto reconnection

5. **TeenPattiTable.jsx** - Game UI components
   - Circular table layout
   - Player seats with animations
   - Action panels
   - Pot display
   - Card rendering

---

## 🎮 Features

### Online Multiplayer
- ✅ 2-6 players per room
- ✅ Real-time Socket.IO
- ✅ Room system (create/join)
- ✅ Turn-based betting
- ✅ Live updates
- ✅ Multiplayer matchmaking

### Offline Bot Mode
- ✅ 1-5 AI opponents
- ✅ 3 difficulty levels
- ✅ Bot personalities
- ✅ No internet required
- ✅ Instant play
- ✅ Intelligent AI

### Game Mechanics
- ✅ Proper hand ranking (Trio → Sequence → Color → Pair → High Card)
- ✅ Turn-based gameplay
- ✅ Fixed ₨10 betting
- ✅ Winner calculation
- ✅ Pot management
- ✅ Player balance tracking

### UI/UX
- ✅ Dark theme with neon accents
- ✅ Smooth Framer Motion animations
- ✅ Responsive design
- ✅ Glassmorphism effects
- ✅ Clear game state visibility
- ✅ Sound toggle

---

## 📁 File Structure

```
neon-game-realm/
│
├── backend/
│   ├── gameLogic.js          # Card game logic
│   ├── gameManager.js        # Game state
│   ├── botService.js         # Bot AI
│   ├── socketHandlers.js     # Socket events
│   ├── server-mvp.js         # Server entry
│   ├── server.js             # Original server
│   ├── package.json
│   └── README.md
│
├── src/
│   ├── pages/
│   │   ├── TeenPattiHub.tsx        # Mode selector
│   │   ├── TeenPattiMVP.tsx        # Online game
│   │   ├── TeenPattiOffline.tsx    # Offline game
│   │   └── TeenPattiGame.tsx       # Original page
│   │
│   ├── components/
│   │   ├── TeenPattiTable.jsx      # Game UI
│   │   └── TeenPattiTable.tsx      # Table component
│   │
│   └── integrations/
│       ├── teenpatti-client.js     # Socket client
│       └── socket.ts              # Original socket
│
├── TEENPATTI_MVP_GUIDE.md          # Online multiplayer guide
├── TEENPATTI_OFFLINE_GUIDE.md      # Offline bot guide
└── PROJECT_SUMMARY.md             # Overall documentation
```

---

## 🚀 Quick Start

### 1. Start Backend Server

```bash
cd backend
npm install
node server-mvp.js
```

Server runs on **http://localhost:3001**

### 2. Start Frontend

```bash
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

### 3. Choose Game Mode

**TeenPattiHub** offers:
- Online Multiplayer (with real players)
- Offline Bot Mode (play against AI)

---

## 🎯 Game Modes

### Online Multiplayer Flow

```
1. Hub → Click "Play Online"
2. Enter name, create or join room
3. Wait for other players
4. Host starts game
5. Players take turns: BET or FOLD
6. Winner gets pot
7. New round or leave
```

### Offline Bot Flow

```
1. Hub → Click "Play Offline"
2. Enter name, select bot count & difficulty
3. Start game
4. Play against AI bots
5. Bots make intelligent decisions
6. Winner gets pot
7. New round or setup
```

---

## 💡 Key Technologies

- **Node.js** - Backend runtime
- **Express** - Web framework
- **Socket.IO** - Real-time communication
- **React** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Vite** - Build tool

---

## 🔌 Socket Events (Online)

### Emit (Client → Server)

```javascript
createRoom({ hostName, roomName })
joinRoom({ roomId, playerName, playerId })
startGame({ roomId })
playerBet({ roomId, playerId, amount })
playerFold({ roomId, playerId })
finishBettingRound({ roomId })
resetGame({ roomId })
leaveRoom({ roomId, playerId })
```

### Listen (Server → Client)

```javascript
roomCreated
roomUpdate
gameStarted
gameUpdate
gameEnd
gameReset
```

---

## 🤖 Bot Difficulty Levels

| Level | Folding | Bluffing | Best For |
|-------|---------|----------|----------|
| **Easy** | 40-60% | Random | Beginners |
| **Medium** | 35% | Occasional | Casual |
| **Hard** | 20% | Strategic | Experienced |

---

## 💰 Currency & Betting

- **Currency:** Nepalese Rupees (₨)
- **Starting Balance:** ₨1000 per player
- **Fixed Bet:** ₨10 per turn
- **Format:** Displays as "₨1,000"

---

## 🎴 Hand Rankings

1. **Trio** (rank: 5) - Three of a kind
2. **Sequence** (rank: 4) - Three consecutive cards
3. **Color** (rank: 3) - Same suit
4. **Pair** (rank: 2) - Two of a kind
5. **High Card** (rank: 1) - Highest card wins

---

## 📊 API Endpoints (Backend)

```
GET  /health                 # Server health check
GET  /api/rooms              # All active rooms
GET  /api/rooms/:roomId      # Specific room details
GET  /api/stats              # Game statistics
```

---

## 🎨 UI Components

### TeenPattiTable.jsx Components

- `<Card />` - Individual playing card
- `<PlayerSeat />` - Player position on table
- `<PotDisplay />` - Pot and stake display
- `<ActionPanel />` - Bet/Fold buttons
- Main game table with circular layout

### Hub Components

- Mode selection cards
- Feature comparison
- Animated background blobs

---

## 🔄 Game Flow Diagram

```
START GAME
    ↓
DEAL CARDS (3 per player)
    ↓
SET CURRENT TURN
    ↓
PLAYER ACTION (BET or FOLD)
    ↓
CHECK WIN CONDITION
    ├─ Only 1 player left → WINNER
    └─ Players continue
    ↓
NEXT PLAYER TURN
    ↓
REPEAT UNTIL END
    ↓
DECLARE WINNER
    ↓
AWARD POT
    ↓
NEW GAME or EXIT
```

---

## 🛠️ Customization

### Change Server Port

Edit `.env` or `server-mvp.js`:

```javascript
const PORT = process.env.PORT || 3001;
```

### Modify Bot Behavior

Edit `botService.js`:

```javascript
const foldThreshold = 0.4; // Adjust
```

### Add Bot Names

Edit `TeenPattiOffline.tsx`:

```javascript
const botNames = ['Name1', 'Name2', ...];
```

### Change Difficulty Names

Edit difficulty options in setup screen.

---

## 📈 Statistics Tracked

- Total rooms active
- Total players online
- Active games
- Waiting rooms
- Total pot value
- Player balances
- Win/loss rates (offline)

---

## ⚙️ Configuration

### Environment Variables

```env
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Game Settings

- Max players: 6
- Starting coins: 1000
- Bet amount: 10
- Min players to start: 2

---

## 🐛 Troubleshooting

### Server won't start
- Check if port 3001 is available
- Verify Node.js version (14+)
- Install dependencies: `npm install`

### Socket connection fails
- Ensure backend is running
- Check CORS configuration
- Verify client URL matches

### Game logic issues
- Check browser console for errors
- Verify hand ranking logic
- Test with different players

### Bots not responding
- Check bot difficulty setting
- Verify game state is "playing"
- Clear browser cache

---

## 📝 Notes

- **MVP Focus:** Core gameplay, not full Teen Patti rules
- **No Real Money:** Virtual ₨ currency only
- **No Authentication:** For demo purposes
- **Production Ready:** Backend architecture is scalable
- **Expandable:** Can add features gradually

---

## 🎯 Next Steps

- [ ] User authentication
- [ ] Leaderboards
- [ ] Hand history
- [ ] Replay system
- [ ] Chat system
- [ ] Achievements
- [ ] Real payment integration
- [ ] Mobile optimization

---

## 📚 Documentation

- **TEENPATTI_MVP_GUIDE.md** - Complete online multiplayer guide
- **TEENPATTI_OFFLINE_GUIDE.md** - Offline bot mode guide
- **Backend README.md** - Server setup instructions
- **Code comments** - Inline documentation

---

## 🎬 Demo Workflow

1. **Start Hub** → TeenPattiHub component
2. **Choose Online** → TeenPattiMVP component
   - Create room
   - Wait for players
   - Start game
   - Play against humans
3. **Or Choose Offline** → TeenPattiOffline component
   - Select difficulty
   - Play against bots
   - Instant gameplay

---

## 👥 Team

- Game Logic: `gameLogic.js`
- State Management: `gameManager.js`
- AI Implementation: `botService.js`
- Real-time Updates: `socketHandlers.js`
- Frontend UI: React components

---

## 📄 License

Part of Neon Game Realm project.

---

**Version:** 1.0.0 Complete  
**Features:** Online + Offline Bot Mode  
**Last Updated:** April 25, 2026  
**Status:** ✅ Production Ready
