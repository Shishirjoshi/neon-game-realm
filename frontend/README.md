# Teen Patti Full Stack MVP

A complete multiplayer Teen Patti card game with Node.js backend and React frontend.

## 🎮 Features

✅ **Multiplayer Rooms** - Create and join game rooms  
✅ **Real-time Updates** - Socket.IO instant synchronization  
✅ **NPR Currency** - ₨10 fixed betting system  
✅ **Turn-based Gameplay** - Proper turn rotation  
✅ **Hand Ranking** - Trio > Sequence > Color > Pair > High Card  
✅ **Winner Calculation** - Automatic winner determination  
✅ **Simple UI** - Clean and easy to use interface  

---

## 📁 Project Structure

```
.
├── backend/
│   ├── package.json      # Backend dependencies
│   ├── server.js         # Express + Socket.IO server
│   └── game.js           # Game logic
│
└── frontend/
    ├── package.json      # Frontend dependencies
    ├── index.html        # HTML entry point
    ├── vite.config.js    # Vite configuration
    └── src/
        ├── main.jsx      # React entry point
        └── App.jsx       # Main React component
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager

### 1️⃣ Start Backend

```bash
cd backend
npm install
npm start
```

**Output:**
```
╔════════════════════════════════════════╗
║  TEEN PATTI MULTIPLAYER MVP BACKEND    ║
║  Socket.IO + NPR Currency              ║
╠════════════════════════════════════════╣
║  Server: http://localhost:5000         ║
║  Games: Room-based Multiplayer         ║
║  Currency: NPR (₨10 fixed bet)         ║
╚════════════════════════════════════════╝
```

✅ Backend running on **http://localhost:5000**

### 2️⃣ Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

**Output:**
```
  VITE v4.3.9 ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

✅ Frontend running on **http://localhost:3000**

### 3️⃣ Play the Game

1. Open **http://localhost:3000** in browser (first player)
2. Enter your name and click "Create Room"
3. Copy the room ID displayed
4. Open **http://localhost:3000** in another browser/tab (second player)
5. Enter your name and click "Join Room"
6. Paste the room ID and join
7. First player clicks "Start Game"
8. Play! 🎮

---

## 📊 Game Rules

- **Players:** 2-6 per room
- **Starting Balance:** ₨1000 each
- **Bet Amount:** ₨10 per turn (fixed)
- **Actions:** BET or FOLD
- **Win:** Last player standing wins entire pot

### Hand Rankings (Best to Worst)

1. **Trio** - Three of same rank
2. **Sequence** - Three consecutive cards
3. **Color** - Same suit
4. **Pair** - Two of same rank
5. **High Card** - Highest card

---

## 🔌 Socket Events

### Client → Server

```javascript
// Create a new room
socket.emit('createRoom', { playerName: 'Alice' });

// Join existing room
socket.emit('joinRoom', { roomId: 'ABC123', playerName: 'Bob' });

// Start game (host only)
socket.emit('startGame', { roomId: 'ABC123' });

// Player action
socket.emit('playerAction', { roomId: 'ABC123', action: 'bet' });
socket.emit('playerAction', { roomId: 'ABC123', action: 'fold' });
```

### Server → Client

```javascript
// Room created
socket.on('roomCreated', (room) => { /* ... */ });

// Room updated (players joined)
socket.on('roomUpdate', (room) => { /* ... */ });

// Game started (cards dealt)
socket.on('gameStarted', (room) => { /* ... */ });

// Game updated (player action)
socket.on('gameUpdate', (room) => { /* ... */ });

// Game ended (winner determined)
socket.on('gameEnd', (room) => { /* ... */ });

// Error occurred
socket.on('error', (message) => { /* ... */ });
```

---

## 🎯 Game Flow

```
1. LOBBY
   ├─ Create Room → New room ID generated
   └─ Join Room → Enter existing room ID

2. ROOM WAITING
   ├─ Players join room
   ├─ Show room info (ID, players, pot)
   └─ Host clicks "Start Game"

3. GAME PLAYING
   ├─ Cards dealt (3 per player)
   ├─ Players take turns clockwise
   ├─ Each turn: BET (₨10) or FOLD
   ├─ Check win condition:
   │  ├─ Only 1 player left → Winner!
   │  └─ All acted → Compare hands
   └─ Award pot to winner

4. GAME END
   ├─ Show winner and pot amount
   └─ Option to play again
```

---

## 💰 Currency Display

All amounts displayed in **Nepalese Rupees (NPR)**:

- `₨10` - Single bet
- `₨1000` - Starting balance
- `₨5000` - Example pot

---

## 🛠️ File Details

### backend/server.js
- Express HTTP server
- Socket.IO connection handler
- Socket event listeners and emitters
- Uses GameManager from game.js

### backend/game.js
- `GameManager` class - Room and game state
- `createRoom(hostId, hostName)` - Create new room
- `joinRoom(roomId, playerId, playerName)` - Join existing room
- `startGame(roomId)` - Initialize game, deal cards
- `playerAction(roomId, playerId, action)` - Process bet/fold

### frontend/src/App.jsx
- React component with all game logic
- Socket.IO client integration
- Three screens: Lobby, Room, Game
- Real-time game updates

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port 5000 is available
# Try different port:
PORT=5001 npm start
```

### Frontend connection error
```
GET http://localhost:5000 - Error
```
- Ensure backend is running
- Check CORS is enabled
- Frontend tries to connect to http://localhost:5000

### Game logic issues
- Check browser console for errors
- Check terminal for server logs
- Refresh and try again

---

## 🔧 Development

### Run in watch mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Build for production

**Frontend:**
```bash
cd frontend
npm run build
```

---

## 📝 Environment Variables

### Backend
Create `.env` in backend folder:
```env
PORT=5000
NODE_ENV=development
```

### Frontend
Create `.env` in frontend folder (Vite):
```env
VITE_SERVER_URL=http://localhost:5000
```

Update `App.jsx`:
```javascript
const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');
```

---

## 🚀 Deployment

### Deploy Backend

**Heroku:**
```bash
cd backend
heroku create teen-patti-backend
git push heroku main
```

### Deploy Frontend

**Vercel:**
```bash
cd frontend
npm run build
vercel deploy --prod
```

Update API URL in `App.jsx` to match deployed backend.

---

## 📋 Checklist

- [x] Backend server (Express + Socket.IO)
- [x] Game logic (hand ranking, winner calculation)
- [x] Room system (create/join)
- [x] Turn system (rotation, fold handling)
- [x] Frontend (React + Socket.IO client)
- [x] Real-time updates
- [x] NPR currency system (₨10 fixed bet)
- [x] UI screens (Lobby, Room, Game)
- [x] Error handling
- [x] Responsive design

---

## 🎓 Learning Resources

- Socket.IO: https://socket.io/docs/
- React: https://react.dev/
- Express: https://expressjs.com/
- Card Game Logic: https://www.wikihow.com/Play-Teen-Patti

---

## 📄 License

MIT License - feel free to use and modify

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs
3. Verify both backend and frontend are running
4. Try restarting servers

---

**Version:** 1.0.0  
**Status:** ✅ Complete and Ready to Play  
**Last Updated:** April 25, 2026
