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
          'flex flex-col items-center gap-2 p-4 rounded-xl glass transition-all duration-300 backdrop-blur-md',
          'border border-primary/30 shadow-lg min-w-[120px]',
          isCurrentTurn && 'ring-2 ring-accent glow-accent shadow-glow-accent scale-105',
          isYou && 'ring-2 ring-primary scale-105'
        )}
      >
        {/* Avatar with status indicator */}
        <div className="relative">
          <PlayerAvatar name={player.username} src={player.avatar_url} />
          <motion.div
            className={cn(
              'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
              player.status === 'playing' && 'bg-green-500 shadow-lg shadow-green-500/50',
              player.status === 'folded' && 'bg-red-500/80',
              player.status === 'idle' && 'bg-yellow-500/80',
              player.status === 'won' && 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
            )}
            animate={isCurrentTurn ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs font-semibold text-foreground truncate max-w-[100px]">{player.username}</p>
          <p className={cn('text-[10px] font-mono', isYou ? 'text-primary' : 'text-muted-foreground')}>
            {isYou ? 'You' : `Seat ${player.seat}`}
          </p>
        </div>

        {/* Balance */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30">
          <span className="text-[10px] font-bold text-accent">₹</span>
          <span className="text-xs font-semibold text-foreground">{(player.coinBalance || 1000).toLocaleString()}</span>
        </div>

        {/* Status */}
        <span
          className={cn(
            'text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border',
            player.status === 'folded' && 'bg-red-500/20 text-red-400 border-red-500/40',
            (player.status === 'playing' || player.status === 'idle') && 'bg-green-500/20 text-green-400 border-green-500/40',
            player.status === 'won' && 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
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
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-primary blur-2xl opacity-30" />
        <div className="relative bg-gradient-to-br from-primary/90 to-accent/90 rounded-full p-6 border-2 border-accent/60 glass-strong shadow-2xl min-w-[180px]">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-accent opacity-80">Pot</p>
            <p className="text-3xl font-bold text-foreground">₹{pot.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Min: ₹{minimumBet}</p>
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
  const waitingPlayer = players.find((p) => p.id === currentTurn);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {isCurrentTurn && (
        <motion.div
          className="flex justify-center gap-2 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NeonButton variant="destructive" size="sm" onClick={() => onAction('fold')} className="min-w-[80px]">
            <X className="h-4 w-4" /> Fold
          </NeonButton>
          <NeonButton variant="secondary" size="sm" onClick={() => onAction('call')} className="min-w-[100px]">
            Call ₹{minimumBet}
          </NeonButton>
          <NeonButton size="sm" onClick={() => setShowRaiseModal(true)} className="min-w-[90px]">
            <TrendingUp className="h-4 w-4" /> Raise
          </NeonButton>
          <NeonButton variant="outline" size="sm" onClick={() => onAction('show')} className="min-w-[70px]">
            Show
          </NeonButton>
        </motion.div>
      )}
      {!isCurrentTurn && waitingPlayer && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
          Waiting for <span className="text-accent font-semibold">{waitingPlayer.username}</span>...
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
    const radius = 260; // Distance from center - adjusted for better fit

    // Position angles based on player count (starting from bottom for human player)
    const angleMap: Record<number, number[]> = {
      2: [90, 270],           // Left, Right
      3: [90, 210, 330],      // Bottom-left, Top, Bottom-right
      4: [45, 135, 225, 315], // Corners
      5: [90, 162, 234, 306, 18], // Pentagon with player at bottom
      6: [90, 150, 210, 270, 330, 30], // Hexagon with player at bottom
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/15 via-accent/10 to-transparent blur-3xl" />
      </div>

      {/* Main Game Area - Centered */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Table Container - Relative positioning for circular layout */}
        <div className="relative w-full max-w-4xl aspect-square max-h-[calc(100vh-180px)]">
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
            {gameState.communityCards && gameState.communityCards.length > 0 && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-32 flex gap-2 z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {gameState.communityCards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    className="w-14 h-20 rounded-lg bg-gradient-to-br from-accent/90 to-primary/90 border-2 border-accent/60 flex items-center justify-center font-bold text-base text-foreground shadow-lg"
                    whileHover={{ scale: 1.08, translateY: -8 }}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
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
        className="w-full px-6 py-4 bg-gradient-to-t from-background via-background/95 to-background/60 border-t border-primary/30 shadow-2xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          {/* Player's Hand */}
          <div className="flex justify-center gap-4 min-h-[120px]">
            <AnimatePresence>
              {gameState.yourCards && gameState.yourCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl bg-gradient-to-br from-primary/95 to-accent/95 border-2 border-accent/60 flex items-center justify-center font-bold text-2xl sm:text-3xl text-foreground cursor-pointer shadow-xl hover:shadow-glow-primary transition-all"
                  initial={{ y: 50, opacity: 0, rotateZ: 15 }}
                  animate={{ y: 0, opacity: 1, rotateZ: idx === 0 ? -10 : idx === 1 ? -5 : idx === 2 ? 5 : 10 }}
                  exit={{ y: 50, opacity: 0 }}
                  whileHover={{ y: -8, scale: 1.05, zIndex: 10 }}
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
