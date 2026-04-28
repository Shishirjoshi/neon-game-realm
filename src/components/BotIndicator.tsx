import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import type { BotDifficulty } from '@/lib/botService';

interface BotIndicatorProps {
  botName: string;
  difficulty?: BotDifficulty;
  isActive?: boolean;
  isThinking?: boolean;
}

/**
 * Visual indicator for bot players
 */
export function BotIndicator({
  botName,
  difficulty = 'medium',
  isActive = false,
  isThinking = false,
}: BotIndicatorProps) {
  const difficultyColors: Record<BotDifficulty, string> = {
    easy: 'bg-green-500/20 border-green-500/50 text-green-300',
    medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    hard: 'bg-red-500/20 border-red-500/50 text-red-300',
  };

  const difficultyLabels: Record<BotDifficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Bot Name */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={isThinking ? { scale: [1, 1.2, 1] } : {}}
          transition={isThinking ? { duration: 0.6, repeat: Infinity } : {}}
          className="text-lg"
        >
          🤖
        </motion.div>
        <span className="font-semibold text-sm">{botName}</span>
      </div>

      {/* Difficulty Badge */}
      <Badge className={`text-xs font-semibold ${difficultyColors[difficulty]}`}>
        {difficultyLabels[difficulty]} Bot
      </Badge>

      {/* Thinking Indicator */}
      {isThinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-1"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
          />
        </motion.div>
      )}

      {/* Active Indicator */}
      {isActive && !isThinking && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-xs font-semibold text-accent px-2 py-1 rounded-full bg-accent/10 border border-accent/30"
        >
          Your Turn
        </motion.div>
      )}
    </div>
  );
}
