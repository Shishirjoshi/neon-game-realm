# Neon Game Realm 🎮

A modern **multiplayer gaming platform** with real-time gameplay, featuring Teen Patti (poker) and Typing Race. Built with React, Vite, Tailwind CSS, and Socket.IO for seamless online competition.

## ✨ Features

### Games Included
- **Teen Patti Royale** - Classic 3-card poker with circular table layout
- **Type Storm** - Real-time typing race with live leaderboard
- **Additional Games** - FPS, Racing, Casual, Strategy (UI templates)

### Real-Time Multiplayer
- ⚡ Socket.IO powered real-time communication
- 🔄 Live player updates and game state sync
- 👥 Multi-player lobbies and room management
- 🎯 Real-time leaderboards and score updates

### Modern UI/UX
- 🌙 Dark theme with neon accents
- ✨ Glassmorphism design system
- 🎨 Smooth Framer Motion animations
- 📱 Fully responsive design
- ♿ Accessible components

### Authentication & Database
- 🔐 Supabase authentication
- 📊 Real-time database integration
- 👤 User profiles and stats

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or bun
- Supabase account (for auth/database)
- Socket.IO server running (see Backend Setup)

### Installation
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your environment
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_SOCKET_URL (e.g., http://localhost:3001)
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── components/
│   ├── TeenPattiTable.tsx      # Poker table with circular layout
│   ├── TypingRaceGame.tsx      # Typing race UI
│   ├── PlayingCard.tsx         # Card component
│   └── ui/                     # shadcn/ui components
├── contexts/
│   ├── SocketContext.tsx       # Real-time connection
│   └── GameContext.tsx         # Game state management
├── pages/
│   ├── Index.tsx               # Home/Game hub
│   ├── Auth.tsx                # Login/Signup
│   ├── Lobby.tsx               # Room creation/joining
│   ├── Room.tsx                # Waiting lobby
│   ├── TeenPattiGame.tsx       # Poker game
│   └── TypingRaceGamePage.tsx  # Typing game
├── hooks/
│   ├── useSocket.ts            # Socket utilities
│   ├── useAuth.ts              # Auth state
│   └── use-toast.ts            # Notifications
└── lib/
    ├── socketService.ts        # Event handlers
    └── rooms.ts                # Room management
```

## 🎮 How to Play

### Teen Patti
1. Go to home page and click "Teen Patti Royale"
2. Create a room or join with code
3. Wait for 2-6 players in lobby
4. Host clicks "Start Game"
5. Play cards: **Fold**, **Call**, **Raise**, or **Show**
6. Winner takes the pot!

### Typing Race
1. Select "Type Storm" from home
2. Create or join a room
3. Race against others in real-time
4. Type the displayed text as fast and accurate as possible
5. Live leaderboard shows WPM and accuracy

## 🔌 Socket.IO Events

### Client Emits
- `joinGame` - Join a game room
- `leaveGame` - Leave the game
- `startGame` - Start game (host)
- `gameAction` - Teen Patti action (fold/call/raise/show)
- `typingUpdate` - Typing progress update

### Server Emits
- `gameState` - Initial state on join
- `gameUpdate` - State changes
- `playerJoined` / `playerLeft` - Player events
- `leaderboardUpdate` - Typing leaderboard
- `error` - Error messages

## 🛠️ Backend Setup

### Socket.IO Server Example (Node.js)

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed instructions.

Quick start:
```bash
npm install express socket.io cors

# Run on localhost:3001
node server.js
```

The server should:
- Accept `joinGame` events
- Manage game state and room persistence
- Broadcast game updates to all players
- Handle player disconnections

## 🎨 Theme & Styling

- **Color Palette**: Primary (blue), Accent (cyan), Dark background
- **Components**: Glassmorphism cards, neon buttons, smooth animations
- **CSS Framework**: Tailwind CSS
- **Animations**: Framer Motion

## 📦 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time communication
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **Supabase** - Backend services

### Backend (Required)
- **Node.js/Express** - Server
- **Socket.IO** - Real-time events
- **Database** - PostgreSQL/Firebase/etc.

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Upload dist/ folder
```

### Backend (Heroku/Railway/Render)
1. Set `SOCKET_URL` environment variable
2. Deploy Socket.IO server
3. Update frontend `.env` to point to production server

## 📚 Documentation

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Architecture & development guide
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Backend server setup (to be created)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT

---

**Made with ❤️ using React + Socket.IO + Tailwind CSS**

