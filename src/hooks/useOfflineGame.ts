/**
 * HOOK: useOfflineGame
 * Simplified hook for integrating offline gameplay
 */

import { useRef, useState, useCallback } from 'react';
import { LocalGameEngine } from '@/lib/localGameEngine';
import type { GamePlayer, TeenPattiGameState } from '@/contexts/GameContext';
import type { BotDifficulty } from '@/lib/botService';

interface UseOfflineGameOptions {
  onStateUpdate?: (state: Partial<TeenPattiGameState>) => void;
  onGameEnd?: (winners: string[]) => void;
}

interface UseOfflineGameReturn {
  isOffline: boolean;
  isInitialized: boolean;
  thinkingBots: string[];
  
  // Methods
  initializeGame: (players: GamePlayer[], gameType: string) => void;
  setBotDifficulty: (playerId: string, difficulty: BotDifficulty) => void;
  startGame: () => void;
  handlePlayerAction: (playerId: string, action: string, amount?: number) => void;
  resetGame: () => void;
  destroyGame: () => void;
}

/**
 * Hook for managing offline game engine
 * Simplifies integration with React components
 * 
 * Usage:
 * ```tsx
 * const offline = useOfflineGame({
 *   onStateUpdate: (state) => setGameState(state),
 * });
 * 
 * // Initialize
 * offline.initializeGame([player1, ...bots], 'teen-patti');
 * offline.setBotDifficulty(botId, 'hard');
 * offline.startGame();
 * 
 * // Handle action
 * offline.handlePlayerAction(playerId, 'raise', 100);
 * ```
 */
export function useOfflineGame(options?: UseOfflineGameOptions): UseOfflineGameReturn {
  const engineRef = useRef<LocalGameEngine | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [thinkingBots, setThinkingBots] = useState<string[]>([]);

  /**
   * Initialize the game engine with players
   */
  const initializeGame = useCallback(
    (players: GamePlayer[], gameType: string = 'teen-patti') => {
      // Cleanup existing engine
      if (engineRef.current) {
        engineRef.current.destroy();
      }

      // Create new engine
      const engine = new LocalGameEngine(gameType as any, players, {
        onStateUpdate: (updates) => {
          options?.onStateUpdate?.(updates);
        },
        onBotAction: (playerId, action, amount) => {
          // Remove bot from thinking list
          setThinkingBots((prev) => prev.filter((id) => id !== playerId));
        },
        onGameEnd: (winners) => {
          options?.onGameEnd?.(winners);
        },
      });

      engineRef.current = engine;
      setIsOffline(true);
      setIsInitialized(true);
    },
    [options]
  );

  /**
   * Set difficulty for a bot
   */
  const setBotDifficulty = useCallback((playerId: string, difficulty: BotDifficulty) => {
    if (engineRef.current) {
      engineRef.current.setBotDifficulty(playerId, difficulty);
    }
  }, []);

  /**
   * Start the game
   */
  const startGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  }, []);

  /**
   * Handle player action
   */
  const handlePlayerAction = useCallback(
    (playerId: string, action: string, amount?: number) => {
      if (engineRef.current) {
        // Add to thinking bots if bot
        const players = engineRef.current.getGameState().players;
        const player = players.find((p) => p.id === playerId);
        if (player && 'isBot' in player && player.isBot) {
          setThinkingBots((prev) => [...new Set([...prev, playerId])]);
        }

        // Handle action
        engineRef.current.handlePlayerAction(
          playerId,
          action as 'fold' | 'call' | 'raise' | 'check',
          amount
        );
      }
    },
    []
  );

  /**
   * Reset the game
   */
  const resetGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
      setThinkingBots([]);
    }
  }, []);

  /**
   * Destroy the engine
   */
  const destroyGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
      setIsOffline(false);
      setIsInitialized(false);
      setThinkingBots([]);
    }
  }, []);

  return {
    isOffline,
    isInitialized,
    thinkingBots,
    initializeGame,
    setBotDifficulty,
    startGame,
    handlePlayerAction,
    resetGame,
    destroyGame,
  };
}
