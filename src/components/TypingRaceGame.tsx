import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassPanel } from './GlassPanel';
import type { TypingGameState } from '@/contexts/GameContext';

interface TypingGameProps {
  gameState: TypingGameState;
  currentUserId: string;
  onTyping: (text: string, wpm: number, accuracy: number) => void;
}

export function TypingRaceGame({ gameState, currentUserId, onTyping }: TypingGameProps) {
  const [inputText, setInputText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate WPM and accuracy
  useEffect(() => {
    if (!startTime || inputText.length === 0) return;

    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const words = inputText.trim().split(/\s+/).length;
    const calculatedWpm = Math.max(0, Math.round((words / elapsedSeconds) * 60));

    const correctChars = Array.from(inputText).filter(
      (char, idx) => char === gameState.textToType[idx]
    ).length;
    const calculatedAccuracy = Math.round((correctChars / inputText.length) * 100) || 100;

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
    onTyping(inputText, calculatedWpm, calculatedAccuracy);
  }, [inputText, startTime, gameState.textToType, onTyping]);

  const handleInputChange = (e: string) => {
    if (!startTime) setStartTime(Date.now());
    setInputText(e);
  };

  const currentUserProgress = useMemo(
    () => gameState.leaderboard.find((p) => p.userId === currentUserId),
    [gameState.leaderboard, currentUserId]
  );

  const isGameActive = gameState.gamePhase === 'active';
  const isGameComplete = gameState.gamePhase === 'completed';

  // Character highlighting
  const getCharClass = (idx: number) => {
    if (idx < inputText.length) {
      return inputText[idx] === gameState.textToType[idx]
        ? 'text-green-400'
        : 'text-red-400 bg-red-400/10';
    }
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5 pt-20 pb-20">
      {/* Ambient backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-40 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute top-40 -left-40 h-[480px] w-[480px] rounded-full bg-primary/30 blur-[140px]" />
      </div>

      <div className="container max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold gradient-text text-glow-primary mb-2">
            Type Storm
          </h1>
          <p className="text-muted-foreground">Race against your friends. Speed wins.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Typing Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <GlassPanel className="p-8 space-y-6">
              {/* Timer and Status */}
              <div className="flex justify-between items-center">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Time Remaining
                    </p>
                    <p className="text-3xl font-bold text-accent">
                      {gameState.timeRemaining || 0}s
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Your WPM
                    </p>
                    <p className="text-3xl font-bold text-primary">{wpm}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Accuracy
                    </p>
                    <motion.p
                      className={cn(
                        'text-3xl font-bold',
                        accuracy >= 95 ? 'text-green-400' : accuracy >= 85 ? 'text-yellow-400' : 'text-red-400'
                      )}
                      animate={{ scale: accuracy < 85 ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {accuracy}%
                    </motion.p>
                  </div>
                </div>

                {/* Game Status Badge */}
                <div className={cn(
                  'px-4 py-2 rounded-full font-semibold text-sm',
                  gameState.gamePhase === 'waiting' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                  gameState.gamePhase === 'counting' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse',
                  gameState.gamePhase === 'active' && 'bg-green-500/20 text-green-400 border border-green-500/30',
                  gameState.gamePhase === 'completed' && 'bg-accent/20 text-accent border border-accent/30',
                )}>
                  {gameState.gamePhase === 'counting' && '🚀 Get Ready!'}
                  {gameState.gamePhase === 'active' && '⚡ Type!'}
                  {gameState.gamePhase === 'completed' && '✨ Race Complete'}
                  {gameState.gamePhase === 'waiting' && '⏳ Waiting...'}
                </div>
              </div>

              {/* Text to Type */}
              <motion.div
                className="min-h-32 p-6 rounded-xl bg-primary/10 border border-primary/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-2xl leading-relaxed font-mono tracking-tight">
                  {Array.from(gameState.textToType).map((char, idx) => (
                    <span key={idx} className={cn(
                      'transition-all duration-75',
                      getCharClass(idx),
                      idx === inputText.length && 'animate-pulse'
                    )}>
                      {char}
                    </span>
                  ))}
                </p>
              </motion.div>

              {/* Input Area */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-muted-foreground">
                  {isGameActive ? 'Start typing...' : isGameComplete ? 'Race finished!' : 'Waiting to start...'}
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={!isGameActive}
                  placeholder="Click here and start typing..."
                  className={cn(
                    'w-full px-4 py-3 rounded-lg bg-background border-2 transition-all',
                    'font-mono text-lg',
                    isGameActive ? 'border-accent focus:border-accent focus:shadow-glow-accent' : 'border-muted opacity-50',
                    'focus:outline-none disabled:cursor-not-allowed'
                  )}
                  autoFocus
                />
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{inputText.length} / {gameState.textToType.length}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: '0%' }}
                    animate={{
                      width: `${(inputText.length / gameState.textToType.length) * 100}%`
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  />
                </div>
              </motion.div>
            </GlassPanel>
          </motion.div>

          {/* Live Leaderboard Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-lg">Live Leaderboard</h3>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {gameState.leaderboard
                  .sort((a, b) => b.wpm - a.wpm)
                  .map((player, idx) => {
                    const isCurrentUser = player.userId === currentUserId;
                    return (
                      <motion.div
                        key={player.userId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all',
                          isCurrentUser
                            ? 'bg-primary/20 border-primary glass-strong'
                            : 'bg-background/40 border-muted/30 hover:border-muted'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'font-bold text-lg w-6',
                              idx === 0 && 'text-yellow-400',
                              idx === 1 && 'text-gray-300',
                              idx === 2 && 'text-orange-400'
                            )}>
                              #{idx + 1}
                            </span>
                            <span className={cn(
                              'font-semibold text-sm',
                              isCurrentUser && 'text-primary'
                            )}>
                              {player.username}
                              {isCurrentUser && ' (You)'}
                            </span>
                          </div>
                          <Zap className={cn(
                            'h-4 w-4',
                            player.wpm > 80 ? 'text-yellow-400' : 'text-muted-foreground'
                          )} />
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">WPM</span>
                            <span className="font-mono font-bold text-accent">{player.wpm}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Accuracy</span>
                            <span className={cn(
                              'font-mono font-bold',
                              player.accuracy >= 95 ? 'text-green-400' : player.accuracy >= 85 ? 'text-yellow-400' : 'text-red-400'
                            )}>
                              {player.accuracy}%
                            </span>
                          </div>
                          <motion.div
                            className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden"
                            layoutId={`progress-${player.userId}`}
                          >
                            <motion.div
                              className="h-full bg-gradient-to-r from-accent to-primary"
                              initial={{ width: '0%' }}
                              animate={{
                                width: `${player.progress * 100}%`
                              }}
                              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Game Complete Screen */}
        <AnimatePresence>
          {isGameComplete && (
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center space-y-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div>
                  <h2 className="text-5xl font-bold gradient-text text-glow-primary mb-2">
                    Race Complete!
                  </h2>
                  <p className="text-muted-foreground">Final Results</p>
                </div>

                <GlassPanel className="p-8 max-w-sm mx-auto">
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Final WPM</p>
                        <p className="text-3xl font-bold text-primary">{currentUserProgress?.wpm || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                        <p className="text-3xl font-bold text-green-400">{currentUserProgress?.accuracy || 0}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Position</p>
                        <p className="text-3xl font-bold text-accent">
                          #{(gameState.leaderboard.findIndex((p) => p.userId === currentUserId) || 0) + 1}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-muted">
                      <p className="text-sm text-muted-foreground mb-3">Top Performers</p>
                      <div className="space-y-2">
                        {gameState.leaderboard.slice(0, 3).map((player, idx) => (
                          <div key={player.userId} className="flex items-center justify-between text-sm">
                            <span>
                              <span className="font-bold">{['🥇', '🥈', '🥉'][idx]}</span>
                              {' '}{player.username}
                            </span>
                            <span className="font-mono font-bold text-accent">{player.wpm} WPM</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
