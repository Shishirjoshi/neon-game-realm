import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function App() {
  // Connection
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // UI State
  const [screen, setScreen] = useState('lobby'); // lobby | room | game
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Game State
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);

  // Initialize socket
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });

    newSocket.on('connect', () => {
      console.log('Connected:', newSocket.id);
      setConnected(true);
      setPlayerId(newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected');
      setConnected(false);
    });

    newSocket.on('roomCreated', (data) => {
      console.log('Room created:', data);
      setRoom(data);
      setScreen('room');
      setSuccess(`✓ Room created: ${data.roomId}`);
    });

    newSocket.on('roomUpdate', (data) => {
      console.log('Room updated:', data);
      setRoom(data);
      setSuccess('✓ Room updated');
    });

    newSocket.on('gameStarted', (data) => {
      console.log('Game started:', data);
      setRoom(data);
      setScreen('game');
      setCurrentPlayer(data.players[data.currentTurn]);
      setSuccess('✓ Game started!');
    });

    newSocket.on('gameUpdate', (data) => {
      console.log('Game updated:', data);
      setRoom(data);
      setCurrentPlayer(data.players[data.currentTurn]);
    });

    newSocket.on('gameEnd', (data) => {
      console.log('Game ended:', data);
      setRoom(data);
      setSuccess(`✓ Game ended! ${data.winner} wins! 🎉`);
    });

    newSocket.on('error', (message) => {
      console.error('Error:', message);
      setError(message);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Clear messages
  useEffect(() => {
    if (error) setTimeout(() => setError(''), 3000);
    if (success) setTimeout(() => setSuccess(''), 3000);
  }, [error, success]);

  // ==================== HANDLERS ====================

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!socket) {
      setError('Not connected to server');
      return;
    }
    socket.emit('createRoom', { playerName });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomIdInput.trim()) {
      setError('Please enter room ID');
      return;
    }
    if (!socket) {
      setError('Not connected to server');
      return;
    }
    socket.emit('joinRoom', { roomId: roomIdInput, playerName });
    setScreen('room');
  };

  const handleStartGame = () => {
    if (!socket || !room) {
      setError('Error');
      return;
    }
    socket.emit('startGame', { roomId: room.roomId });
  };

  const handleBet = () => {
    if (!socket || !room) {
      setError('Error');
      return;
    }
    socket.emit('playerAction', { roomId: room.roomId, action: 'bet' });
  };

  const handleFold = () => {
    if (!socket || !room) {
      setError('Error');
      return;
    }
    socket.emit('playerAction', { roomId: room.roomId, action: 'fold' });
  };

  const handleNewGame = () => {
    setRoom(null);
    setScreen('lobby');
    setPlayerName('');
    setRoomIdInput('');
  };

  // ==================== RENDER ====================

  return (
    <div className="container">
      <div className="header">
        <h1>♠️ Teen Patti ♠️</h1>
        <p>Multiplayer Card Game • NPR Currency (₨)</p>
        <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* LOBBY SCREEN */}
      {screen === 'lobby' && (
        <div className="lobby-screen">
          <h2 className="title">Welcome to Teen Patti</h2>

          <div className="input-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            />
          </div>

          <div className="button-group">
            <button className="btn-primary" onClick={handleCreateRoom}>
              Create Room
            </button>
            <button className="btn-secondary" onClick={() => setScreen('join')}>
              Join Room
            </button>
          </div>

          <div className="info-box">
            <h3>How to Play:</h3>
            <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
              <li>Create a room or join an existing one</li>
              <li>Wait for other players to join</li>
              <li>Host starts the game</li>
              <li>Take turns: BET ₨10 or FOLD</li>
              <li>Last player standing wins the pot</li>
            </ul>
          </div>
        </div>
      )}

      {/* JOIN ROOM SCREEN */}
      {screen === 'join' && (
        <div className="lobby-screen">
          <h2 className="title">Join a Room</h2>

          <div className="input-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="input-group">
            <label>Room ID:</label>
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="Enter room ID"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
          </div>

          <div className="button-group">
            <button className="btn-primary" onClick={handleJoinRoom}>
              Join
            </button>
            <button className="btn-secondary" onClick={() => setScreen('lobby')}>
              Back
            </button>
          </div>
        </div>
      )}

      {/* ROOM SCREEN */}
      {screen === 'room' && room && (
        <div className="room-screen">
          <h2 className="title">Room: {room.roomId}</h2>

          <div className="info-box">
            <div className="info-text">
              <span>Room ID:</span>
              <strong>{room.roomId}</strong>
            </div>
            <div className="info-text">
              <span>Players:</span>
              <strong>{room.players.length}</strong>
            </div>
            <div className="info-text">
              <span>Pot:</span>
              <strong>₨{room.pot}</strong>
            </div>
            <div className="info-text">
              <span>Status:</span>
              <strong>{room.state}</strong>
            </div>
          </div>

          <div className="players-list">
            <h3>Players ({room.players.length}):</h3>
            {room.players.map((player, idx) => (
              <div key={player.id} className="player-item">
                <div>
                  <div className="player-name">{player.name}</div>
                  <div className="player-status">
                    {player.id === playerId && '(You) '}
                    {room.hostId === player.id && '(Host)'}
                  </div>
                </div>
                <div className="player-coins">₨{player.coins}</div>
              </div>
            ))}
          </div>

          {room.state === 'waiting' && room.hostId === playerId && (
            <button className="btn-success" onClick={handleStartGame} style={{ width: '100%' }}>
              Start Game (Minimum 2 players)
            </button>
          )}

          {room.state === 'finished' && (
            <div>
              <div className="game-status">🎉 Game Over! Winner: {room.winner}</div>
              <button className="btn-primary" onClick={handleNewGame} style={{ width: '100%' }}>
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME SCREEN */}
      {screen === 'game' && room && (
        <div className="game-screen">
          <h2 className="title">Game In Progress</h2>

          <div className="pot-info">
            <p>Current Pot</p>
            <h2>₨{room.pot}</h2>
          </div>

          {currentPlayer && (
            <div className="game-status">
              {currentPlayer.id === playerId ? "🎯 Your Turn!" : `${currentPlayer.name}'s Turn`}
            </div>
          )}

          <div className="players-list">
            <h3>Players:</h3>
            {room.players.map((player) => (
              <div key={player.id} className="player-item">
                <div>
                  <div className="player-name">
                    {player.name}
                    {player.id === playerId && ' (You)'}
                  </div>
                  <div className="player-status">
                    {player.folded ? '❌ Folded' : '✓ Active'} • Bet: ₨{player.currentBet}
                  </div>
                </div>
                <div className="player-coins">₨{player.coins}</div>
              </div>
            ))}
          </div>

          {currentPlayer && currentPlayer.id === playerId && !currentPlayer.folded && (
            <div className="action-buttons">
              <button className="btn-success" onClick={handleBet}>
                Bet ₨10
              </button>
              <button className="btn-danger" onClick={handleFold}>
                Fold
              </button>
            </div>
          )}

          {room.state === 'finished' && (
            <div>
              <div className="game-status">🎉 Winner: {room.winner}</div>
              <button className="btn-primary" onClick={handleNewGame} style={{ width: '100%' }}>
                New Game
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
