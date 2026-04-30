import { useState, useMemo } from 'react';
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
  isOfflineMode?: boolean;
  thinkingBots?: string[];
}

// Component for individual player seat
function PlayerSeat({ 
  player, 
  isCurrentTurn, 
  isYou, 
  position 
}: { 
  player: GamePlayer; 
  isCurrentTurn: boolean; 
  isYou: boolean; 
  position: { angle: number; distance: number } 
}) {
  const x = Math.cos((position.angle * Math.PI) / 180) * position.distance;
  const y = Math.sin((position.angle * Math.PI) / 180) * position.distance;

  return (
    <motion.div
      className="absolute"
      style={{
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-3 p-6 rounded-2xl glass transition-all duration-300 backdrop-blur-md',
          'border border-primary/30 shadow-lg',
          isCurrentTurn && 'ring-2 ring-accent glow-accent shadow-glow-accent scale-105',
          isYou && 'ring-2 ring-primary scale-105'
        )}
      >
        {/* Avatar */}
        <div className="relative">
          <PlayerAvatar name={player.username} src={player.avatar_url} />
          <motion.div
            className={cn(
              'absolute bottom-0 right-0 h-3 w-3 rounded-full',
              player.status === 'playing' && 'bg-green-500 shadow-lg shadow-green-500',
              player.status === 'folded' && 'bg-red-500/60',
              player.status === 'idle' && 'bg-yellow-500/60'
            )}
            animate={isCurrentTurn ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs font-semibold text-foreground">{player.username}</p>
          <p className={cn('text-xs font-mono', isYou ? 'text-primary' : 'text-muted-foreground')}>
            {isYou ? 'You' : `Seat ${player.seat}`}
          </p>
        </div>

        {/* Balance */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 border border-primary/30">
          <span className="text-xs font-bold text-accent">₹</span>
          <span className="text-xs font-semibold text-foreground">{(player.coinBalance || 1000).toLocaleString()}</span>
        </div>

        {/* Status */}
        <span
          className={cn(
            'text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-full',
            player.status === 'folded' && 'bg-red-500/20 text-red-400 border border-red-500/30',
            (player.status === 'playing' || player.status === 'idle') && 'bg-green-500/20 text-green-400 border border-green-500/30',
            player.status === 'won' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          )}
        >
          {player.status}
        </span>
      </div>
    </motion.div>
  );
}

// Pot Display Component
function PotDisplay({ pot, minimumBet }: { pot: number; minimumBet: number }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent to-primary blur-xl opacity-40" />
        <div className="relative bg-gradient-to-br from-primary/85 to-accent/85 rounded-2xl p-8 border-2 border-accent/60 glass-strong shadow-2xl">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-mono uppercase tracking-widest text-accent opacity-75">Pot</p>
            <p className="text-5xl font-bold text-foreground">₹{pot.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Min: ₹{minimumBet}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Action Panel Component
function ActionPanel({ 
  isCurrentTurn, 
  currentTurn, 
  players, 
  minimumBet, 
  onAction, 
  setShowRaiseModal 
}: { 
  isCurrentTurn: boolean; 
  currentTurn: string; 
  players: GamePlayer[]; 
  minimumBet: number; 
  onAction: (action: 'fold' | 'call' | 'raise' | 'show', amount?: number) => void; 
  setShowRaiseModal: (show: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      {isCurrentTurn && (
        <motion.div
          className="flex justify-center gap-3 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NeonButton variant="destructive" size="sm" onClick={() => onAction('fold')}>
            <X className="h-4 w-4" /> Fold
          </NeonButton>
          <NeonButton variant="secondary" size="sm" onClick={() => onAction('call')}>
            Call ₹{minimumBet}
          </NeonButton>
          <NeonButton size="sm" onClick={() => setShowRaiseModal(true)}>
            <TrendingUp className="h-4 w-4" /> Raise
          </NeonButton>
          <NeonButton variant="outline" size="sm" onClick={() => onAction('show')}>
            Show
          </NeonButton>
        </motion.div>
      )}
      {!isCurrentTurn && (
        <p className="text-sm text-muted-foreground">
          ⏳ Waiting for <span className="text-accent font-semibold">{players.find((p) => p.id === currentTurn)?.username || 'player'}</span>...
        </p>
      )}
    </div>
  );
}

export function TeenPattiTable({ gameState, currentUserId, onAction, isOfflineMode, thinkingBots }: TeenPattiTableProps) {
  const [selectedRaiseAmount, setSelectedRaiseAmount] = useState(0);
  const [showRaiseModal, setShowRaiseModal] = useState(false);

  const isCurrentPlayerTurn = gameState.currentPlayerTurn === currentUserId;

  // Calculate positions for 2-6 players in circular layout
  const playerPositions = useMemo(() => {
    const playerCount = gameState.players.length;
    const radius = 280; // Distance from center
    
    // Position angles based on player count
    const angleMap: Record<number, number[]> = {
      2: [0, 180],
      3: [0, 120, 240],
      4: [45, 135, 225, 315],
      5: [0, 72, 144, 216, 288],
      6: [0, 60, 120, 180, 240, 300],
    };

    const angles = angleMap[playerCount] || angleMap[3];
    return gameState.players.map((_, idx) => ({
      angle: angles[idx % angles.length],
      distance: radius,
    }));
  }, [gameState.players.length]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-b from-background via-background to-primary/10 overflow-hidden flex flex-col">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-primary/15 via-accent/10 to-transparent blur-3xl" />
      </div>

      {/* Main Game Area - Centered */}
      <div className="flex-1 flex items-center justify-center relative px-4 py-8">
        {/* Table Container - Relative positioning for circular layout */}
        <div className="relative w-full max-w-5xl aspect-square max-h-[calc(100vh-200px)]">
          {/* Center point reference */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-accent/50 rounded-full z-0" />

          {/* Player Seats */}
          {gameState.players.map((player, index) => (
            <PlayerSeat
              key={player.id}
              player={player}
              isCurrentTurn={gameState.currentPlayerTurn === player.id}
              isYou={player.id === currentUserId}
              position={playerPositions[index]}
            />
          ))}

          {/* Pot Display - Centered */}
          <PotDisplay pot={gameState.pot} minimumBet={gameState.minimumBet} />

          {/* Community Cards - Below Pot */}
          <AnimatePresence>
            {gameState.communityCards.length > 0 && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-40 flex gap-3 z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {gameState.communityCards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    className="w-16 h-24 rounded-lg bg-gradient-to-br from-accent/90 to-primary/90 border-2 border-accent/60 flex items-center justify-center font-bold text-lg text-foreground shadow-lg"
                    whileHover={{ scale: 1.08, translateY: -8 }}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    {card}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Panel - Player Cards & Controls */}
      <motion.div
        className="w-full px-4 py-6 bg-gradient-to-t from-background via-background/95 to-background/60 border-t border-primary/30 shadow-2xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          {/* Player's Hand */}
          <div className="flex justify-center gap-6 min-h-[140px]">
            <AnimatePresence>
              {gameState.yourCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  className="w-28 h-40 rounded-xl bg-gradient-to-br from-primary/95 to-accent/95 border-2 border-accent/60 flex items-center justify-center font-bold text-4xl text-foreground cursor-pointer shadow-xl hover:shadow-glow-primary transition-all"
                  initial={{ y: 50, opacity: 0, rotateZ: 20 }}
                  animate={{ y: 0, opacity: 1, rotateZ: idx === 0 ? -8 : idx === 2 ? 8 : 0 }}
                  exit={{ y: 50, opacity: 0 }}
                  whileHover={{ y: -12, scale: 1.08 }}
                >
                  {card}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Action Controls */}
          <ActionPanel
            isCurrentTurn={isCurrentPlayerTurn}
            currentTurn={gameState.currentPlayerTurn}
            players={gameState.players}
            minimumBet={gameState.minimumBet}
            onAction={onAction}
            setShowRaiseModal={setShowRaiseModal}
          />
        </div>
      </motion.div>

      {/* Raise Modal */}
      <AnimatePresence>
        {showRaiseModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRaiseModal(false)}
          >
            <motion.div
              className="glass rounded-2xl p-8 max-w-sm w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-6">Raise Bet</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-3 block">Amount: ₹{selectedRaiseAmount}</label>
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
                  <NeonButton variant="secondary" onClick={() => setShowRaiseModal(false)} className="flex-1">
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
