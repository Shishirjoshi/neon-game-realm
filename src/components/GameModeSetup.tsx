import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';
import { NeonButton } from './NeonButton';
import {
  getDifficultyLabel,
  getDifficultyDescription,
  type BotDifficulty,
} from '@/lib/botService';

interface GameModeSetupProps {
  onModeSelected: (mode: 'online' | 'offline', botCount?: number, difficulty?: BotDifficulty) => void;
  onCancel?: () => void;
}

export function GameModeSetup({ onModeSelected, onCancel }: GameModeSetupProps) {
  const [step, setStep] = useState<'mode' | 'bot-setup'>('mode');
  const [botCount, setBotCount] = useState(1);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');

  const handleOnlineMode = () => {
    onModeSelected('online');
  };

  const handleOfflineMode = () => {
    setStep('bot-setup');
  };

  const handleBotSetupComplete = () => {
    onModeSelected('offline', botCount, difficulty);
  };

  if (step === 'mode') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <GlassPanel className="p-8 max-w-md w-full mx-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent to-cyan-400">
            Game Mode
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Choose how you want to play
          </p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOnlineMode}
              className="w-full p-4 rounded-lg border-2 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🌐</div>
                <div>
                  <div className="font-bold text-lg text-accent">Online</div>
                  <div className="text-sm text-muted-foreground">
                    Play with real players
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOfflineMode}
              className="w-full p-4 rounded-lg border-2 border-cyan-400/30 hover:border-cyan-400 hover:bg-cyan-400/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <div className="font-bold text-lg text-cyan-400">Offline</div>
                  <div className="text-sm text-muted-foreground">
                    Play against bots
                  </div>
                </div>
              </div>
            </motion.button>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full mt-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}
        </GlassPanel>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <GlassPanel className="p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          Setup Offline Game
        </h2>
        <p className="text-center text-muted-foreground mb-6 text-sm">
          Configure your game against bots
        </p>

        {/* Bot Count Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3">
            Number of Bots: <span className="text-cyan-400">{botCount}</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((count) => (
              <motion.button
                key={count}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBotCount(count)}
                className={`flex-1 py-2 px-3 rounded-lg transition-all font-semibold ${
                  botCount === count
                    ? 'bg-cyan-400/20 border-2 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-2 border-white/10 text-muted-foreground hover:border-cyan-400/50'
                }`}
              >
                {count}
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You + {botCount} bot{botCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Bot Difficulty Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3">Bot Difficulty</label>
          <div className="space-y-2">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <motion.button
                key={diff}
                whileHover={{ x: 4 }}
                onClick={() => setDifficulty(diff)}
                className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
                  difficulty === diff
                    ? 'bg-cyan-400/10 border-cyan-400'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{getDifficultyLabel(diff)}</span>
                  {difficulty === diff && (
                    <span className="text-cyan-400">✓</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getDifficultyDescription(diff)}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">Game Setup:</span>
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• You vs {botCount} bot{botCount !== 1 ? 's' : ''}</li>
            <li>• Difficulty: {getDifficultyLabel(difficulty)}</li>
            <li>• No internet required</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <NeonButton
            onClick={handleBotSetupComplete}
            variant="primary"
            className="w-full"
          >
            Start Offline Game
          </NeonButton>
          <button
            onClick={() => setStep('mode')}
            className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
