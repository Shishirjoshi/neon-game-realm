import React, { useState, useEffect } from 'react';
import TeenPattiClient from '@/integrations/teenpatti-client';

/**
 * TEEN PATTI MVP - SIMPLE GAME PAGE
 * Demonstrates socket integration and game flow
 */
const TeenPattiMVP = () => {
  const [client, setClient] = useState(null);
  const [userId, setUserId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [room, setRoom] = useState(null);
  const [gameStatus, setGameStatus] = useState('lobby'); // lobby | roomWaiting | playing | finished
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [allRooms, setAllRooms] = useState([]);

  /**
   * INITIALIZE SOCKET CLIENT
   */
  useEffect(() => {
    const initClient = async () => {
      try {
        const newClient = new TeenPattiClient('http://localhost:3001');
        await newClient.connect();
        setClient(newClient);
        setUserId(newClient.socket.id);
        setSuccessMessage('Connected to server');
      } catch (err) {
        setError(`Connection failed: ${err.message}`);
      }
    };

    initClient();

    return () => {
      client?.disconnect();
    };
  }, []);

  /**
   * LISTEN TO SOCKET EVENTS
   */
  useEffect(() => {
    if (!client) return;

    const handleRoomUpdate = (data) => {
      setRoom(data.room);
      setSuccessMessage(data.message || 'Room updated');
    };

    const handleGameStarted = (data) => {
      setRoom(data.room);
      setCurrentPlayer(data.currentPlayerTurn);
      setGameStatus('playing');
      setSuccessMessage(`Game started! ${data.currentPlayerTurn.name}'s turn`);
    };

    const handleGameUpdate = (data) => {
      setRoom(data.room);
      setCurrentPlayer(data.currentPlayerTurn);
      setSuccessMessage(`${data.player.name} ${data.action}${data.amount ? ` ₨${data.amount}` : ''}`);
    };

    const handleGameEnd = (data) => {
      setGameStatus('finished');
      setSuccessMessage(`🎉 ${data.winner.name} won ₨${data.pot}!`);
    };

    client.on('roomUpdate', handleRoomUpdate);
    client.on('gameStarted', handleGameStarted);
    client.on('gameUpdate', handleGameUpdate);
    client.on('gameEnd', handleGameEnd);

    return () => {
      client.off('roomUpdate', handleRoomUpdate);
      client.off('gameStarted', handleGameStarted);
      client.off('gameUpdate', handleGameUpdate);
      client.off('gameEnd', handleGameEnd);
    };
  }, [client]);

  /**
   * FETCH ALL ROOMS
   */
  const fetchAllRooms = async () => {
    try {
      const rooms = await client.getAllRooms();
      setAllRooms(rooms);
    } catch (err) {
      setError(`Failed to fetch rooms: ${err.message}`);
    }
  };

  /**
   * CREATE ROOM
   */
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const newRoom = await client.createRoom(playerName, `${playerName}'s Room`);
      setRoom(newRoom);
      setGameStatus('roomWaiting');
      setSuccessMessage('Room created! Waiting for players...');
      setError('');
    } catch (err) {
      setError(`Failed to create room: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * JOIN ROOM
   */
  const handleJoinRoom = async (joinRoomId) => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const joinedRoom = await client.joinRoom(joinRoomId, playerName, userId);
      setRoom(joinedRoom);
      setRoomId(joinRoomId);
      setGameStatus('roomWaiting');
      setSuccessMessage('Successfully joined room!');
      setError('');
    } catch (err) {
      setError(`Failed to join room: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * START GAME
   */
  const handleStartGame = async () => {
    if (room.hostId !== userId) {
      setError('Only host can start game');
      return;
    }

    setLoading(true);
    try {
      const updatedRoom = await client.startGame(room.roomId);
      setRoom(updatedRoom);
      setGameStatus('playing');
      setError('');
    } catch (err) {
      setError(`Failed to start game: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * PLAYER BET
   */
  const handleBet = async () => {
    setLoading(true);
    try {
      const updatedRoom = await client.bet(room.roomId, userId, 10);
      setRoom(updatedRoom);
      setError('');
    } catch (err) {
      setError(`Failed to bet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * PLAYER FOLD
   */
  const handleFold = async () => {
    setLoading(true);
    try {
      const updatedRoom = await client.fold(room.roomId, userId);
      setRoom(updatedRoom);
      setError('');
    } catch (err) {
      setError(`Failed to fold: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * NEW GAME
   */
  const handleNewGame = async () => {
    setLoading(true);
    try {
      const updatedRoom = await client.resetGame(room.roomId);
      setRoom(updatedRoom);
      setGameStatus('roomWaiting');
      setError('');
    } catch (err) {
      setError(`Failed to reset game: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * LEAVE ROOM
   */
  const handleLeaveRoom = async () => {
    try {
      await client.leaveRoom(room.roomId, userId);
      setRoom(null);
      setGameStatus('lobby');
      setSuccessMessage('Left room');
      setError('');
    } catch (err) {
      setError(`Failed to leave room: ${err.message}`);
    }
  };

  // ===============================================
  // RENDER STATES
  // ===============================================

  // LOBBY - Player enters name and chooses action
  if (!room && gameStatus === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Teen Patti MVP</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Name Input */}
          <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 mb-8">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 mb-6 focus:outline-none focus:border-cyan-400"
            />

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>

              <button
                onClick={fetchAllRooms}
                className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all"
              >
                Browse Rooms
              </button>
            </div>
          </div>

          {/* Available Rooms */}
          {allRooms.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">Available Rooms</h2>
              <div className="space-y-2">
                {allRooms.map((r) => (
                  <div
                    key={r.roomId}
                    className="bg-white/5 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white font-bold">{r.roomName}</p>
                      <p className="text-gray-400 text-sm">
                        Players: {r.playerCount}/{r.maxPlayers} | Pot: ₨{r.pot}
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(r.roomId)}
                      disabled={loading || r.playerCount >= r.maxPlayers}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ROOM WAITING - Waiting for game to start
  if (room && gameStatus === 'roomWaiting') {
    const isHost = room.hostId === userId;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">{room.roomName}</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Players */}
          <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Players ({room.players.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {room.players.map((player) => (
                <div key={player.id} className="bg-white/5 p-4 rounded-lg">
                  <p className="text-white font-bold">{player.name}</p>
                  <p className="text-gray-400">Balance: ₨{player.coins}</p>
                  {player.id === room.hostId && (
                    <p className="text-yellow-400 text-sm">👑 Host</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {isHost && room.players.length >= 2 && (
              <button
                onClick={handleStartGame}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>
            )}

            <button
              onClick={handleLeaveRoom}
              className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING - Game in progress
  if (room && gameStatus === 'playing') {
    const currentPlayerObj = room.players[room.currentTurnIndex];
    const isMyTurn = currentPlayerObj?.id === userId;
    const myPlayer = room.players.find((p) => p.id === userId);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">{room.roomName}</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Pot Display */}
            <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm mb-2">POT</p>
              <p className="text-3xl font-bold text-cyan-400">₨{room.pot}</p>
            </div>

            {/* Current Turn */}
            <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm mb-2">CURRENT TURN</p>
              <p className="text-3xl font-bold text-purple-400">{currentPlayerObj?.name}</p>
            </div>

            {/* Your Balance */}
            <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm mb-2">YOUR BALANCE</p>
              <p className="text-3xl font-bold text-green-400">₨{myPlayer?.coins}</p>
            </div>
          </div>

          {/* Players Table */}
          <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Players</h2>
            <div className="space-y-2">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg flex justify-between items-center ${
                    player.id === currentPlayerObj?.id ? 'bg-cyan-500/20' : 'bg-white/5'
                  }`}
                >
                  <div>
                    <p className="text-white font-bold">{player.name}</p>
                    <p className="text-gray-400 text-sm">
                      Balance: ₨{player.coins} | Bet: ₨{player.currentBet}
                    </p>
                  </div>
                  {player.folded && <p className="text-red-400 font-bold">FOLDED</p>}
                  {player.id === currentPlayerObj?.id && (
                    <p className="text-cyan-400 font-bold">🎯 TURN</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {isMyTurn && !myPlayer?.folded && (
            <div className="flex gap-4">
              <button
                onClick={handleBet}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Betting...' : 'Bet ₨10'}
              </button>

              <button
                onClick={handleFold}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Folding...' : 'Fold'}
              </button>
            </div>
          )}

          {!isMyTurn && !myPlayer?.folded && (
            <div className="text-center text-gray-400 py-4">
              Waiting for {currentPlayerObj?.name}...
            </div>
          )}

          {myPlayer?.folded && (
            <div className="text-center text-red-400 font-bold py-4">
              You have folded. Waiting for game to end...
            </div>
          )}
        </div>
      </div>
    );
  }

  // FINISHED - Game ended
  if (room && gameStatus === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Game Finished!</h1>

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Final Players */}
          <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Final Results</h2>
            <div className="space-y-2">
              {room.players.map((player) => (
                <div key={player.id} className="bg-white/5 p-4 rounded-lg">
                  <p className="text-white font-bold">{player.name}</p>
                  <p className="text-gray-400 text-sm">Balance: ₨{player.coins}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {room.hostId === userId && (
              <button
                onClick={handleNewGame}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Starting...' : 'New Game'}
              </button>
            )}

            <button
              onClick={handleLeaveRoom}
              className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TeenPattiMVP;
