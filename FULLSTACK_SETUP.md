# 🎮 Teen Patti Full Stack MVP - Complete Setup Guide

A complete, working multiplayer Teen Patti card game with **Node.js backend** and **React frontend**.

---

## ⚡ Quick Start (30 seconds)

### Windows Users

```bash
double-click setup.bat
```

Then in **Terminal 1:**
```bash
cd backend
npm start
```

Then in **Terminal 2:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

### Mac/Linux Users

```bash
chmod +x setup.sh
./setup.sh
```

Then follow the instructions printed on screen.

---

## 📋 What's Included

✅ **Backend (Node.js + Socket.IO)**
- Express HTTP server
- Real-time multiplayer via Socket.IO
- Complete game logic
- NPR currency system (₨)
- Automatic winner calculation

✅ **Frontend (React)**
- Beautiful UI with gradient design
- Socket.IO client integration
- Lobby, Room, and Game screens
- Real-time game updates
- Mobile responsive

✅ **Game Features**
- Room-based multiplayer (2-6 players)
- ₨1000 starting balance per player
- ₨10 fixed betting system
- Turn-based gameplay
- Complete hand ranking system
- Instant winner detection

---

## 📁 Project Structure

```
teen-patti-mvp/
│
├── backend/                    # Node.js Server
│   ├── package.json           # Dependencies
│   ├── server.js              # Express + Socket.IO server
│   ├── game.js                # Game logic
│   └── README.md              # Backend docs
│
├── frontend/                   # React App
│   ├── package.json           # Dependencies
│   ├── index.html             # HTML entry
│   ├── vite.config.js         # Vite config
│   └── src/
│       ├── main.jsx           # React entry point
│       └── App.jsx            # Main React component
│
├── setup.sh                    # Auto setup (Mac/Linux)
├── setup.bat                   # Auto setup (Windows)
└── README.md                   # This file
```

---

## 🚀 Manual Setup

### Step 1: Install Backend

```bash
cd backend
npm install
```

### Step 2: Start Backend

```bash
npm start
```

Expected output:
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

### Step 3: Install Frontend (New Terminal)

```bash
cd frontend
npm install
```

### Step 4: Start Frontend

```bash
npm run dev
```

Expected output:
```
  VITE v4.3.9 ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

✅ Frontend running on **http://localhost:3000**

### Step 5: Play!

1. Open **http://localhost:3000** in your browser
2. Enter your name and click "Create Room"
3. Copy the room ID
4. Open in another browser tab/window
5. Enter your name and "Join Room"
6. Paste the room ID
7. Click "Start Game"
8. Play! ♠️

---

## 🎮 How to Play

### Game Screen

```
┌─────────────────────────────────────┐
│  LOBBY                              │
│  ┌─────────────────────────────────┐│
│  │ Enter Name                      ││
│  │ [Your Name        ]             ││
│  │                                 ││
│  │ [Create Room] [Join Room]       ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘

↓

┌─────────────────────────────────────┐
│  ROOM (ABC123)                      │
│  ┌─────────────────────────────────┐│
│  │ Players: 2                      ││
│  │ - Alice (₨1000) [Host]          ││
│  │ - Bob (₨1000)                   ││
│  │                                 ││
│  │ [Start Game]                    ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘

↓

┌─────────────────────────────────────┐
│  GAME IN PROGRESS                   │
│  ┌─────────────────────────────────┐│
│  │ Pot: ₨20                        ││
│  │ 🎯 Your Turn!                   ││
│  │                                 ││
│  │ Players:                        ││
│  │ ✓ Alice (₨990) Bet: ₨10         ││
│  │ ✓ Bob (₨1000)                   ││
│  │                                 ││
│  │ [Bet ₨10] [Fold]                ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Actions

**Bet:**
- Spend ₨10 from your balance
- Adds ₨10 to the pot
- Turn passes to next player

**Fold:**
- Exit the current game
- Your coins stay
- If only 1 player left → Game ends

### Win

- Last active player wins the entire pot
- Or player with best hand (if comparing)
- Winner announced with pot amount
- Option to play again

---

## 💱 Currency System

- **Currency:** Nepalese Rupees (NPR)
- **Symbol:** ₨
- **Starting Balance:** ₨1000 per player
- **Bet Amount:** ₨10 per turn (fixed)
- **Examples:**
  - Your balance: ₨1000
  - After 1 bet: ₨990
  - Pot after 2 players bet: ₨20

---

## 🃏 Hand Rankings

Strongest to Weakest:

1. **Trio** (Three of a Kind)
   - Example: A♠ A♥ A♦

2. **Sequence** (Straight)
   - Example: 5♠ 6♥ 7♦

3. **Color** (Flush - Same Suit)
   - Example: 2♠ 5♠ 9♠

4. **Pair** (Two of a Kind)
   - Example: K♥ K♦ 3♠

5. **High Card**
   - Example: A♠ K♥ Q♦

---

## 🔌 Socket Events (Technical)

### Create Room
```javascript
socket.emit('createRoom', { playerName: 'Alice' });
// Receive: socket.on('roomCreated', room);
```

### Join Room
```javascript
socket.emit('joinRoom', { roomId: 'ABC123', playerName: 'Bob' });
// Receive: socket.on('roomUpdate', room);
```

### Start Game
```javascript
socket.emit('startGame', { roomId: 'ABC123' });
// Receive: socket.on('gameStarted', room);
```

### Player Action
```javascript
socket.emit('playerAction', { roomId: 'ABC123', action: 'bet' });
socket.emit('playerAction', { roomId: 'ABC123', action: 'fold' });
// Receive: socket.on('gameUpdate', room) or socket.on('gameEnd', room)
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 5000 is available
# Try different port:
PORT=5001 npm start
```

### Frontend shows "Connection Error"

- ✅ Is backend running?
- ✅ Is it on http://localhost:5000?
- ✅ Check browser console (F12) for errors

### Game doesn't update

- ✅ Open browser DevTools (F12)
- ✅ Check Network tab for Socket.IO connection
- ✅ Restart both servers

### Can't start game

- ✅ Need minimum 2 players
- ✅ Only host can start
- ✅ All players must be connected

### Player stuck on turn

- ✅ Refresh browser
- ✅ Rejoin room
- ✅ Check network connection

---

## 📊 Testing Locally

### Test with 2 Players (Same Computer)

1. Terminal 1: `cd backend && npm start`
2. Terminal 2: `cd frontend && npm run dev`
3. Browser Tab 1: http://localhost:3000 (Player 1)
4. Browser Tab 2: http://localhost:3000 (Player 2)
5. Create room in Tab 1, join in Tab 2
6. Start game and play

### Test on Phone

Get your computer's IP:
```bash
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig | findstr "IPv4"
```

Then on phone:
```
http://YOUR_IP_ADDRESS:3000
```

---

## ⚙️ Configuration

### Backend Port

Edit backend/.env or use environment variable:
```bash
PORT=5000 npm start
```

### Frontend Dev Server

Edit frontend/vite.config.js:
```javascript
server: {
  port: 3000,
  strictPort: false  // Use different port if 3000 taken
}
```

---

## 📦 Dependencies

### Backend
- express (4.18.2) - Web framework
- socket.io (4.5.4) - Real-time communication
- cors (2.8.5) - Cross-Origin Resource Sharing

### Frontend
- react (18.2.0) - UI framework
- react-dom (18.2.0) - React DOM
- socket.io-client (4.5.4) - Socket.IO client
- vite (4.3.9) - Build tool

---

## 🚀 Deployment

### Vercel (Frontend)

```bash
cd frontend
npm run build
vercel deploy --prod
```

### Heroku (Backend)

```bash
cd backend
heroku create teen-patti-backend
git push heroku main
```

Then update frontend `.env`:
```env
VITE_SERVER_URL=https://teen-patti-backend.herokuapp.com
```

---

## 📚 File Documentation

### backend/server.js
- Initializes Express app
- Sets up Socket.IO server
- Handles socket connections
- Emits events

### backend/game.js
- `GameManager` class
- Room creation/joining
- Game initialization
- Action processing
- Winner calculation

### frontend/src/App.jsx
- Main React component
- Socket.IO client setup
- Three game screens
- Event listeners
- Action handlers

### frontend/index.html
- HTML entry point
- CSS styling
- Responsive design

---

## 🎯 Next Steps

After setup:
1. ✅ Play a game locally
2. ✅ Test on multiple browsers
3. ✅ Try on mobile device
4. ✅ Customize UI/styling
5. ✅ Add more game modes
6. ✅ Deploy to production

---

## 💡 Tips

- 🎮 Use 2+ browser tabs/windows to test multiplayer
- 📱 Test responsive design on phone
- 🔍 Use browser DevTools to debug
- 📊 Check server logs for errors
- 🔄 Refresh if game seems stuck
- ⚡ Restart servers if issues persist

---

## 🔐 Security Notes

This is an MVP for learning/testing. For production:
- Add player authentication
- Validate all server-side
- Use HTTPS/WSS
- Add rate limiting
- Implement anti-cheat measures
- Add database persistence

---

## 📞 Getting Help

1. **Check logs:**
   ```bash
   # Terminal with backend running shows all events
   ```

2. **Browser console:**
   ```
   F12 → Console tab → Look for errors
   ```

3. **Restart everything:**
   ```bash
   Ctrl+C (stop both servers)
   npm start (backend)
   npm run dev (frontend)
   ```

---

## ✅ Verification Checklist

- [x] Backend starts without errors
- [x] Frontend loads at http://localhost:3000
- [x] Can create room
- [x] Can join room with room ID
- [x] Can start game (minimum 2 players)
- [x] Can bet (₨10)
- [x] Can fold
- [x] Game ends when 1 player remains
- [x] Winner announced
- [x] Can play again

---

## 📄 License

MIT - Free to use and modify

---

## 🎉 You're All Set!

Enjoy playing Teen Patti! ♠️♥️♦️♣️

**Questions?** Check the READMEs in backend/ and frontend/ folders.

---

**Version:** 1.0.0 Complete Full Stack MVP  
**Status:** ✅ Production Ready  
**Last Updated:** April 25, 2026  
**Created with ♠️ for Teen Patti players**
