import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Helper: Format currency in NPR
 */
const formatCurrency = (amount) => `₨${amount?.toLocaleString('en-IN') || 0}`;

/**
 * CARD COMPONENT
 * Displays a single playing card with suit and rank
 */
const Card = ({ rank, suit, hidden = false, index = 0 }) => {
  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  const suitColors = {
    hearts: 'text-red-500',
    diamonds: 'text-red-500',
    clubs: 'text-black',
    spades: 'text-black',
  };

  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="w-20 h-28 rounded-lg bg-white shadow-lg border-2 border-gray-200 flex flex-col items-center justify-center relative cursor-pointer hover:shadow-xl transition-all hover:scale-105"
    >
      {hidden ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <div className="text-white text-2xl font-bold">?</div>
        </div>
      ) : (
        <>
          <div className={`text-2xl font-bold ${suitColors[suit] || 'text-black'}`}>
            {suitSymbols[suit] || ''}
          </div>
          <div className="text-xl font-bold text-gray-800">{rank}</div>
        </>
      )}
    </motion.div>
  );
};

/**
 * PLAYER SEAT COMPONENT
 * Represents a player position around the table
 */
const PlayerSeat = ({ player, isCurrentUser, isCurrentTurn, position, totalPlayers }) => {
  const angle = (position / totalPlayers) * 360;
  const radius = 200;
  const x = radius * Math.cos((angle * Math.PI) / 180);
  const y = radius * Math.sin((angle * Math.PI) / 180);

  const statusColors = {
    blind: 'bg-yellow-500',
    seen: 'bg-blue-500',
    folded: 'bg-red-500',
    waiting: 'bg-gray-500',
  };

  const statusBg = statusColors[player.status] || 'bg-gray-500';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      className="absolute w-24 flex flex-col items-center"
    >
      {/* Highlight ring for active player */}
      {isCurrentTurn && (
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(59, 130, 246, 0.7)',
              '0 0 0 15px rgba(59, 130, 246, 0)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -inset-2 rounded-full border-2 border-blue-400"
        />
      )}

      {/* Avatar */}
      <motion.div
        className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-3 border-white ${
          isCurrentTurn ? 'ring-4 ring-blue-400' : ''
        }`}
        whileHover={{ scale: 1.1 }}
      >
        {player.name?.charAt(0).toUpperCase()}
      </motion.div>

      {/* Player Info */}
      <div className="text-center mt-2">
        <p className="text-sm font-semibold text-white truncate w-full">
          {player.name || 'Player'}
        </p>
        <p className="text-xs text-gray-300">{formatCurrency(player.coins)}</p>
      </div>

      {/* Status Badge */}
      {player.status && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`mt-1 px-2 py-1 rounded-full text-xs font-bold text-white ${statusBg}`}
        >
          {player.status}
        </motion.div>
      )}

      {/* Current Bet */}
      {player.currentBet > 0 && (
        <motion.div
          initial={{ scale: 0, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          className="mt-1 px-2 py-1 rounded bg-green-500 text-xs font-bold text-white"
        >
          {formatCurrency(player.currentBet)}
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * POT DISPLAY COMPONENT
 */
const PotDisplay = ({ pot, currentStake }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center"
    >
      <motion.div
        animate={{
          textShadow: [
            '0 0 10px rgba(59, 130, 246, 0.5)',
            '0 0 20px rgba(59, 130, 246, 1)',
            '0 0 10px rgba(59, 130, 246, 0.5)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-3xl font-bold text-cyan-400"
      >
        Pot: {formatCurrency(pot)}
      </motion.div>
      <div className="text-lg text-purple-300 mt-2">
        Stake: {formatCurrency(currentStake)}
      </div>
    </motion.div>
  );
};

/**
 * ACTION PANEL COMPONENT
 */
const ActionPanel = ({
  currentUserId,
  currentTurnId,
  playerCoins,
  pot,
  stake,
  playerStatus,
  onAction,
  actionLoading,
}) => {
  const [betAmount, setBetAmount] = useState(stake);
  const [showBetInput, setShowBetInput] = useState(false);

  const isMyTurn = currentUserId === currentTurnId;
  const isFolded = playerStatus === 'folded';
  const minBet = stake;
  const maxBet = Math.min(playerCoins, stake * 4);

  const handleBet = () => {
    if (betAmount >= minBet && betAmount <= maxBet) {
      onAction({ type: 'bet', amount: betAmount });
      setShowBetInput(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 right-6 bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-6 shadow-2xl max-w-sm"
    >
      {!isMyTurn || isFolded ? (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">
            {isFolded ? 'You have folded' : 'Waiting for your turn...'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction({ type: 'fold' })}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Fold
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction({ type: 'see' })}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              See
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBetInput(!showBetInput)}
              disabled={actionLoading}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Bet
            </motion.button>
          </div>

          {/* Bet Input */}
          <AnimatePresence>
            {showBetInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Slider */}
                <input
                  type="range"
                  min={minBet}
                  max={maxBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />

                {/* Bet Amount Display */}
                <div className="text-center">
                  <p className="text-cyan-400 font-bold text-lg">
                    {formatCurrency(betAmount)}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Min: {formatCurrency(minBet)} | Max: {formatCurrency(maxBet)}
                  </p>
                </div>

                {/* Confirm Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBet}
                  disabled={actionLoading || betAmount < minBet || betAmount > maxBet}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {actionLoading ? 'Betting...' : 'Confirm Bet'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

/**
 * MAIN TEEN PATTI TABLE COMPONENT
 */
const TeenPattiTable = ({
  socket,
  roomId,
  players = [],
  currentUserId,
  currentTurnId,
  pot = 0,
  currentStake = 10,
  gameState = 'waiting',
  playerHand = [],
  onAction = () => {},
  onGameEnd = () => {},
}) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentPlayer = players.find((p) => p.id === currentUserId) || {};
  const otherPlayers = players.filter((p) => p.id !== currentUserId);

  const handleAction = (action) => {
    setActionLoading(true);
    onAction(action);

    // Emit socket event
    if (socket) {
      socket.emit('playerAction', {
        roomId,
        userId: currentUserId,
        ...action,
      });
    }

    // Simulate action completion (adjust based on server response)
    setTimeout(() => setActionLoading(false), 500);
  };

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleGameUpdate = (data) => {
      console.log('Game updated:', data);
    };

    const handleGameEnd = (data) => {
      onGameEnd(data);
    };

    socket.on('gameUpdate', handleGameUpdate);
    socket.on('gameEnd', handleGameEnd);

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('gameEnd', handleGameEnd);
    };
  }, [socket, onGameEnd]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 left-6 right-6 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Teen Patti
            </h1>
            <p className="text-gray-400 text-sm">Room: {roomId}</p>
          </div>

          {/* Sound Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-cyan-400" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-400" />
            )}
          </motion.button>
        </motion.div>

        {/* Game Table Area */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Table Background */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-green-900/50 to-slate-900/50 shadow-2xl border-2 border-cyan-400/30 backdrop-blur-sm"
          />

          {/* Pot Display */}
          <PotDisplay pot={pot} currentStake={currentStake} />

          {/* Players Around Table */}
          <div className="relative w-full h-full flex items-center justify-center">
            {otherPlayers.map((player, index) => (
              <PlayerSeat
                key={player.id}
                player={player}
                isCurrentUser={false}
                isCurrentTurn={player.id === currentTurnId}
                position={index}
                totalPlayers={otherPlayers.length || 1}
              />
            ))}
          </div>
        </div>

        {/* Player Hand (Bottom Center) */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-4 items-end"
        >
          {playerHand.length > 0 ? (
            playerHand.map((card, index) => (
              <Card
                key={index}
                rank={card.rank}
                suit={card.suit}
                index={index}
              />
            ))
          ) : (
            <div className="text-gray-400 text-center">
              <p>Waiting for cards...</p>
            </div>
          )}
        </motion.div>

        {/* Current Player Info (Bottom Left) */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-4 shadow-2xl"
        >
          <p className="text-cyan-400 font-bold text-lg">{currentPlayer.name}</p>
          <p className="text-gray-300 text-sm mt-2">
            Balance: {formatCurrency(currentPlayer.coins)}
          </p>
          {currentPlayer.status && (
            <p className="text-purple-400 text-sm mt-1">
              Status: {currentPlayer.status}
            </p>
          )}
        </motion.div>

        {/* Game State Indicator */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
        >
          <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-20">
            {gameState.toUpperCase()}
          </div>
        </motion.div>
      </div>

      {/* Action Panel */}
      <ActionPanel
        currentUserId={currentUserId}
        currentTurnId={currentTurnId}
        playerCoins={currentPlayer.coins || 0}
        pot={pot}
        stake={currentStake}
        playerStatus={currentPlayer.status}
        onAction={handleAction}
        actionLoading={actionLoading}
      />

      {/* Styles for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Custom range slider styling */
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default TeenPattiTable;
