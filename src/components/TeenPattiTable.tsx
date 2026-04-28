import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import { NeonButton } from './NeonButton';
import { cn } from '@/lib/utils';
import type { TeenPattiGameState, GamePlayer } from '@/contexts/GameContext';

interface TeenPattiTableProps {
  gameState: TeenPattiGameState;
  currentUserId: string;
  onAction: (action: 'fold' | 'call' | 'raise' | 'show', amount?: number) => void;
}

export function TeenPattiTable({ gameState, currentUserId, onAction }: TeenPattiTableProps) {
  const [selectedRaiseAmount, setSelectedRaiseAmount] = useState(0);
  const [showRaiseModal, setShowRaiseModal] = useState(false);

  const currentUserSeat = useMemo(
    () => gameState.players.find((p) => p.id === currentUserId)?.seat ?? 0,
    [gameState.players, currentUserId]
  );

  const isCurrentPlayerTurn = gameState.currentPlayerTurn === currentUserId;

  // Calculate circular positions for players (poker table layout)
  const playerPositions = useMemo(() => {
    const positions: Record<number, { top: string; left: string; transform: string }> = {
      0: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      1: { top: '20%', left: '80%', transform: 'translate(-50%, -50%)' },
      2: { top: '20%', left: '50%', transform: 'translate(-50%, -50%)' },
      3: { top: '20%', left: '20%', transform: 'translate(-50%, -50%)' },
      4: { top: '50%', left: '20%', transform: 'translate(-50%, -50%)' },
      5: { top: '80%', left: '20%', transform: 'translate(-50%, -50%)' },
      6: { top: '80%', left: '50%', transform: 'translate(-50%, -50%)' },
    };
    return positions;
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Table background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Circular table gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl" />
      </div>

      {/* Players Circle */}
      <div className="relative w-full h-screen flex items-center justify-center">
        {gameState.players.map((player, index) => {
          const position = playerPositions[index] || playerPositions[0];
          const isCurrentTurn = gameState.currentPlayerTurn === player.id;
          const isYou = player.id === currentUserId;

          return (
            <motion.div
              key={player.id}
              className="absolute"
              style={{
                top: position.top,
                left: position.left,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={cn(
                  'flex flex-col items-center gap-3 p-4 rounded-2xl glass transition-all duration-300',
                  isCurrentTurn && 'ring-2 ring-accent glow-accent shadow-glow-accent',
                  isYou && 'ring-2 ring-primary'
                )}
              >
                {/* Avatar */}
                <div className="relative">
                  <PlayerAvatar name={player.username} src={player.avatar_url} />

                  {/* Status indicator */}
                  <motion.div
                    className={cn(
                      'absolute bottom-0 right-0 h-3 w-3 rounded-full',
                      player.status === 'playing' && 'bg-green-500 shadow-glow-success',
                      player.status === 'folded' && 'bg-red-500/50',
                      player.status === 'idle' && 'bg-muted'
                    )}
                    animate={
                      isCurrentTurn
                        ? { scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }
                        : {}
                    }
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>

                {/* Player Info */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {player.username}
                  </p>
                  <p className={cn('text-xs font-mono', isYou ? 'text-primary' : 'text-muted-foreground')}>
                    {isYou ? 'You' : `Seat ${player.seat}`}
                  </p>
                </div>

                {/* Coin Balance */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
                  <span className="text-xs font-bold text-accent">₹</span>
                  <span className="text-sm font-semibold text-foreground">
                    {(player.coinBalance || 1000).toLocaleString()}
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={cn(
                    'text-xs font-mono uppercase tracking-widest px-2 py-1 rounded-full',
                    player.status === 'folded' &&
                    'bg-red-500/20 text-red-400 border border-red-500/30',
                    (player.status === 'playing' || player.status === 'idle') &&
                    'bg-green-500/20 text-green-400 border border-green-500/30',
                    player.status === 'won' &&
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  )}
                >
                  {player.status}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Center Pot */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="relative">
            {/* Pot glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-primary blur-2xl opacity-50" />

            {/* Pot card */}
            <div className="relative bg-gradient-to-br from-primary/80 to-accent/80 rounded-2xl p-8 border border-accent/50 glass-strong shadow-2xl">
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-mono uppercase tracking-widest text-accent opacity-80">
                  Pot
                </p>
                <p className="text-4xl font-bold text-foreground">₹{gameState.pot.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Min bet: ₹{gameState.minimumBet}</p>
              </div>
            </div>
          </div>

          {/* Community Cards */}
          {gameState.communityCards.length > 0 && (
            <motion.div
              className="mt-6 flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {gameState.communityCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  className="w-16 h-24 rounded-lg bg-gradient-to-br from-accent to-primary border-2 border-accent/50 flex items-center justify-center font-bold text-foreground shadow-lg"
                  whileHover={{ scale: 1.05, rotateY: -10 }}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {card}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Player Hand (Bottom) */}
      <motion.div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full px-4 py-6 bg-gradient-to-t from-background via-background/80 to-transparent border-t border-primary/20"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Your cards */}
          <div className="flex justify-center gap-4 mb-6">
            <AnimatePresence>
              {gameState.yourCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 50, opacity: 0, rotateZ: 20 }}
                  animate={{ y: 0, opacity: 1, rotateZ: idx === 0 ? -8 : idx === 2 ? 8 : 0 }}
                  exit={{ y: 50, opacity: 0 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="w-20 h-32 rounded-xl bg-gradient-to-br from-primary/90 to-accent/90 border-2 border-accent/50 flex items-center justify-center font-bold text-xl text-foreground cursor-pointer shadow-lg hover:shadow-glow-primary transition-shadow"
                >
                  {card}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Game Controls */}
          {isCurrentPlayerTurn && (
            <motion.div
              className="flex justify-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <NeonButton
                variant="destructive"
                size="lg"
                onClick={() => onAction('fold')}
              >
                <X className="h-4 w-4" />
                Fold
              </NeonButton>

              <NeonButton
                variant="secondary"
                size="lg"
                onClick={() => onAction('call')}
              >
                Call ₹{gameState.minimumBet}
              </NeonButton>

              <NeonButton
                size="lg"
                onClick={() => setShowRaiseModal(true)}
              >
                <TrendingUp className="h-4 w-4" />
                Raise
              </NeonButton>

              <NeonButton
                variant="outline"
                size="lg"
                onClick={() => onAction('show')}
              >
                Show
              </NeonButton>
            </motion.div>
          )}

          {!isCurrentPlayerTurn && (
            <div className="text-center text-sm text-muted-foreground">
              Waiting for {gameState.players.find((p) => p.id === gameState.currentPlayerTurn)?.username || 'player'}...
            </div>
          )}
        </div>
      </motion.div>

      {/* Raise Modal */}
      <AnimatePresence>
        {showRaiseModal && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRaiseModal(false)}
          >
            <motion.div
              className="glass rounded-2xl p-6 max-w-sm mx-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Raise Bet</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Amount: ₹{selectedRaiseAmount}
                  </label>
                  <input
                    type="range"
                    min={gameState.minimumBet}
                    max={gameState.pot * 2}
                    value={selectedRaiseAmount}
                    onChange={(e) => setSelectedRaiseAmount(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <NeonButton
                    variant="secondary"
                    onClick={() => setShowRaiseModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </NeonButton>
                  <NeonButton
                    onClick={() => {
                      onAction('raise', selectedRaiseAmount);
                      setShowRaiseModal(false);
                    }}
                    className="flex-1"
                  >
                    Raise
                  </NeonButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
