import { useState, useMemo, useEffect } from 'react';
import type { TeenPattiGameState, GamePlayer } from '@/contexts/GameContext';
import '@/styles/TeenPattiTableRedesigned.css';

interface TeenPattiTableProps {
  gameState: TeenPattiGameState;
  currentUserId: string;
  onAction: (action: 'fold' | 'call' | 'raise' | 'show', amount?: number) => void;
  isOfflineMode?: boolean;
  thinkingBots?: string[];
  onGameEnd?: (winner: GamePlayer) => void;
}

// Get badge HTML based on last action
function getBadgeInfo(lastAction?: string) {
  if (!lastAction) return null;
  const badges: Record<string, { className: string; label: string }> = {
    won: { className: 'badge-won', label: 'WON' },
    fold: { className: 'badge-fold', label: 'FOLD' },
    call: { className: 'badge-call', label: 'CALL' },
    raise: { className: 'badge-raise', label: 'RAISE' },
    thinking: { className: 'badge-thinking', label: '...' },
  };
  return badges[lastAction];
}

// Format card display
function formatCard(card: string): { rank: string; suit: string } {
  const suits = ['♥', '♦', '♣', '♠'];
  const suit = card.slice(-1);
  const rank = card.slice(0, -1);
  return { rank, suit };
}

function isRedSuit(suit: string): boolean {
  return suit === '♥' || suit === '♦';
}

export function TeenPattiTable({ 
  gameState, 
  currentUserId, 
  onAction, 
  isOfflineMode, 
  thinkingBots,
  onGameEnd
}: TeenPattiTableProps) {
  const [selectedRaiseAmount, setSelectedRaiseAmount] = useState(0);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [gameLog, setGameLog] = useState<string[]>(['Game started!', 'Cards dealt!']);

  const isCurrentPlayerTurn = gameState.currentPlayerTurn === currentUserId;
  const currentPlayer = gameState.players.find(p => p.id === currentUserId);
  const isDealer = gameState.players[0]?.id === currentUserId;

  // Calculate positions for players in circular layout
  const playerPositions = useMemo(() => {
    const playerCount = gameState.players.length;
    const radius = 240;

    const angleMap: Record<number, number[]> = {
      2: [0, 180],
      3: [270, 30, 150],
      4: [0, 90, 180, 270],
      5: [270, 0, 90, 135, 180],
      6: [0, 60, 120, 180, 240, 300],
    };

    const angles = angleMap[playerCount] || angleMap[3];
    return gameState.players.map((_, idx) => ({
      angle: angles[idx % angles.length],
      distance: radius,
    }));
  }, [gameState.players.length]);

  const getRenderPosition = (index: number) => {
    const pos = playerPositions[index];
    const x = Math.cos((pos.angle * Math.PI) / 180) * pos.distance;
    const y = Math.sin((pos.angle * Math.PI) / 180) * pos.distance;
    return { x, y };
  };

  const handleAction = (action: 'fold' | 'call' | 'raise' | 'show', amount?: number) => {
    onAction(action, amount);
    const messages: Record<string, string> = {
      fold: 'You folded',
      call: `You called ₹${gameState.minimumBet}`,
      raise: `You raised to ₹${amount}`,
      show: 'You called Show!',
    };
    setGameLog(prev => [...prev.slice(-4), messages[action]]);
  };

  return (
    <div className="teen-patti-container">
      {/* Background Table Felt */}
      <div className="table-felt" />

      {/* Game Container */}
      <div className="game-container">
        {/* Round Badge - Top Left */}
        <div className="round-badge">
          <div className="round-label">Round</div>
          <div className="round-num">{(gameState.roundHistory?.length || 0) + 1}</div>
        </div>

        {/* Game Log - Top Right */}
        <div className="game-log">
          <div className="log-title">Game Log</div>
          <div className="log-entries">
            {gameLog.slice(-5).map((entry, idx) => (
              <div key={idx} className="log-entry">{entry}</div>
            ))}
          </div>
        </div>

        {/* Players Ring */}
        <div className="players-ring">
          {gameState.players.map((player, idx) => {
            if (player.id === currentUserId) return null; // Don't render current player here

            const { x, y } = getRenderPosition(idx);
            const isActive = gameState.currentPlayerTurn === player.id;
            const playerColors: Record<number, string> = {
              0: '#4a7ff5', 1: '#e57373', 2: '#81c784', 3: '#ffd700', 4: '#ba68c8', 5: '#ffb74d'
            };
            const playerColor = playerColors[idx] || '#4a7ff5';
            const badge = player.status === 'won' ? { className: 'badge-won', label: 'WON' } : null;

            return (
              <div
                key={player.id}
                className={`player-card ${isActive ? 'active' : ''} ${
                  player.status === 'folded' ? 'folded' : ''
                } ${player.status === 'won' ? 'winner' : ''}`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Avatar */}
                <div
                  className="player-avatar"
                  style={{
                    background: `${playerColor}22`,
                    color: playerColor,
                  }}
                >
                  {player.username.charAt(0).toUpperCase()}
                  <div
                    className={`status-dot ${player.status === 'folded' ? 'folded' : 'online'}`}
                  />
                </div>

                {/* Name */}
                <div className="player-name">
                  {player.username}
                  {idx === 0 && <span className="dealer-chip">D</span>}
                </div>

                {/* Seat */}
                <div className="player-seat">Seat {player.seat || idx + 1}</div>

                {/* Chips */}
                <div className="player-chips">₹{(player.coinBalance || 0).toLocaleString()}</div>

                {/* Badge */}
                {badge && <div className={`player-badge ${badge.className}`}>{badge.label}</div>}

                {/* Face-down cards */}
                {player.status !== 'folded' && (
                  <div className="opp-cards">
                    <div className="opp-card" />
                    <div className="opp-card" />
                    <div className="opp-card" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pot Display - Centered */}
        <div className="pot-display">
          <div className="pot-label">Pot</div>
          <div className="pot-amount">₹{gameState.pot.toLocaleString()}</div>
          <div className="pot-min">Min: ₹{gameState.minimumBet}</div>
        </div>

        {/* My Hand - Bottom Center */}
        {currentPlayer && currentPlayer.status !== 'folded' && (
          <div className="my-hand">
            {gameState.yourCards?.map((card, idx) => {
              const { rank, suit } = formatCard(card);
              const isRed = isRedSuit(suit);
              return (
                <div
                  key={idx}
                  className={`hand-card ${isRed ? 'red-suit' : 'black-suit'}`}
                >
                  <div className="card-corner">{rank}{suit}</div>
                  <div className="rank">{rank}</div>
                  <div className="suit">{suit}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Bar - Bottom Center */}
        <div className="action-bar">
          <button
            className="btn btn-fold"
            onClick={() => handleAction('fold')}
            disabled={!isCurrentPlayerTurn}
          >
            ✕ Fold
          </button>
          <button
            className="btn btn-call"
            onClick={() => handleAction('call')}
            disabled={!isCurrentPlayerTurn}
          >
            Call ₹{gameState.minimumBet}
          </button>
          <button
            className="btn btn-raise"
            onClick={() => setShowRaiseModal(true)}
            disabled={!isCurrentPlayerTurn}
          >
            ↑ Raise
          </button>
          <button
            className="btn btn-show"
            onClick={() => handleAction('show')}
            disabled={!isCurrentPlayerTurn}
          >
            Show
          </button>
        </div>

        {/* Waiting Text */}
        {!isCurrentPlayerTurn && (
          <div className="waiting-text">
            <span className="pulse-dot" />
            Waiting for {gameState.players.find(p => p.id === gameState.currentPlayerTurn)?.username}...
          </div>
        )}
      </div>

      {/* Raise Modal */}
      {showRaiseModal && (
        <div className="result-overlay show" onClick={() => setShowRaiseModal(false)}>
          <div className="result-box" onClick={e => e.stopPropagation()}>
            <div className="result-title" style={{ fontSize: '24px', marginBottom: '16px' }}>
              Raise Bet
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                Amount: ₹{selectedRaiseAmount}
              </label>
              <input
                type="range"
                min={gameState.minimumBet}
                max={gameState.pot * 2}
                value={selectedRaiseAmount}
                onChange={e => setSelectedRaiseAmount(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-call"
                onClick={() => setShowRaiseModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-raise"
                onClick={() => {
                  handleAction('raise', selectedRaiseAmount);
                  setShowRaiseModal(false);
                }}
                style={{ flex: 1 }}
              >
                Raise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Overlay */}
      {gameState.gamePhase === 'showdown' && (
        <div className="result-overlay show">
          <div className="result-box">
            <div className="result-title">
              {gameState.players.find(p => p.status === 'won')?.id === currentUserId ? '🎉 You Win!' : `${gameState.players.find(p => p.status === 'won')?.username} Wins!`}
            </div>
            <div className="result-sub">
              Best hand — pot of ₹{gameState.pot.toLocaleString()} collected
            </div>
            <button
              className="btn-next"
              onClick={() => {
                // This will be handled by parent component
                window.location.reload();
              }}
            >
              Next Round →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
