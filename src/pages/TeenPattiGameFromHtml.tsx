import React, { useState } from 'react';
import '../styles/TeenPattiGameHtml.css';

interface Player {
  id: number;
  name: string;
  status: string;
}

export const TeenPattiGameFromHtml: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', status: 'Waiting' },
    { id: 2, name: 'Player 2', status: 'Waiting' },
    { id: 3, name: 'Player 3', status: 'Waiting' },
  ]);

  const handleStartGame = () => {
    setGameStarted(true);
    setPlayers(players.map(p => ({ ...p, status: 'Playing' })));
    alert('Game started!');
  };

  const handleReset = () => {
    setGameStarted(false);
    setPlayers(players.map(p => ({ ...p, status: 'Waiting' })));
    window.location.reload();
  };

  return (
    <div className="game-container">
      <h1 className="game-title">🎰 TEEN PATTI 🎰</h1>

      <div className="game-board">
        <div className="game-info">
          <p>Welcome to Teen Patti</p>
          <p>{gameStarted ? 'Game In Progress' : 'Waiting for players...'}</p>
        </div>

        <div className="players-section">
          {players.map(player => (
            <div key={player.id} className="player-card">
              <h3>{player.name}</h3>
              <p>Status: {player.status}</p>
            </div>
          ))}
        </div>

        <div className="button-group">
          <button onClick={handleStartGame} disabled={gameStarted}>
            Start Game
          </button>
          <button onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default TeenPattiGameFromHtml;
