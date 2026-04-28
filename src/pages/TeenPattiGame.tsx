import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '@/contexts/SocketContext';
import { useGameState } from '@/contexts/GameContext';
import { useAuth } from '@/hooks/useAuth';
import { TeenPattiTable } from '@/components/TeenPattiTable';
import { GlassPanel } from '@/components/GlassPanel';
import { GameModeSetup } from '@/components/GameModeSetup';
import { createBotPlayers, type BotDifficulty } from '@/lib/botService';
import { LocalGameEngine } from '@/lib/localGameEngine';
import type { TeenPattiGameState, GamePlayer } from '@/contexts/GameContext';

export default function TeenPattiGame() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const { gameState, setGameState, currentRoom } = useGameState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showModeSetup, setShowModeSetup] = useState(false);
  const [thinkingBots, setThinkingBots] = useState<Set<string>>(new Set());

  // Local game engine reference
  const gameEngineRef = useRef<LocalGameEngine | null>(null);

  /**
   * Initialize offline game with bot players
   */
  const initializeOfflineGame = (
    botPlayers: GamePlayer[],
    difficulty: BotDifficulty = 'medium'
  ) => {
    setIsOffline(true);

    // Create all players
    const humanPlayer: GamePlayer = {
      id: user?.id || 'player-1',
      username: user?.user_metadata?.username || 'You',
      avatar_url: null,
      seat: 0,
      isReady: true,
      coinBalance: 1000,
      status: 'playing' as const,
    };

    const allPlayers = [
      humanPlayer,
      ...botPlayers.map((bot, i) => ({
        ...bot,
        seat: i + 1,
      })),
    ];

    // Create local game engine
    const engine = new LocalGameEngine('teen-patti', allPlayers, {
      onStateUpdate: (updates) => {
        setGameState((prev) => (prev ? { ...prev, ...updates } : null));
      },
      onBotAction: (playerId, action, amount) => {
        handleBotAction(playerId, action, amount);
      },
      onGameEnd: (winners) => {
        console.log('Game ended. Winners:', winners);
      },
    });

    // Set bot difficulties
    botPlayers.forEach((bot) => {
      engine.setBotDifficulty(bot.id, difficulty);
    });

    gameEngineRef.current = engine;

    // Create initial game state
    const initialState: TeenPattiGameState = {
      type: 'teen-patti',
      players: allPlayers,
      currentPlayerTurn: allPlayers[0].id,
      communityCards: [],
      pot: 0,
      minimumBet: 50,
      yourCards: ['K♠', 'Q♦', 'J♣'],
      yourSeat: 0,
      gamePhase: 'dealing',
      roundHistory: [],
    };

    setGameState(initialState);
    setLoading(false);

    // Start game after delay
    setTimeout(() => {
      engine.startGame();
    }, 1000);
  };

  /**
   * Handle game mode selection
   */
  const handleModeSelected = (
    mode: 'online' | 'offline',
    botCount?: number,
    difficulty?: BotDifficulty
  ) => {
    if (mode === 'offline' && botCount && difficulty) {
      const bots = createBotPlayers(botCount, 1, difficulty);
      initializeOfflineGame(bots, difficulty);
      setShowModeSetup(false);
    } else if (mode === 'online') {
      // Continue with online mode
      setShowModeSetup(false);
      setLoading(false);
    }
  };

  /**
   * Handle bot action for UI updates
   */
  const handleBotAction = (
    playerId: string,
    action: string,
    amount: number
  ) => {
    // Clear thinking indicator for this bot
    setThinkingBots((prev) => {
      const next = new Set(prev);
      next.delete(playerId);
      return next;
    });
  };

  /**
   * Handle player action (for both online and offline)
   */
  const handleGameAction = (
    action: 'fold' | 'call' | 'raise' | 'show',
    amount?: number
  ) => {
    if (isOffline && gameEngineRef.current) {
      // Offline mode - use local engine
      gameEngineRef.current.handlePlayerAction(
        user?.id || '',
        action,
        amount
      );
    } else if (socket && user) {
      // Online mode - use socket
      socket.emit('gameAction', {
        roomCode: code,
        userId: user.id,
        action,
        amount: amount || 0,
      });
    }
  };

  // Initialize game
  useEffect(() => {
    // Check if we already have bot players set up
    if (currentRoom?.botPlayers && currentRoom.botPlayers.length > 0 && !gameState) {
      initializeOfflineGame(currentRoom.botPlayers, currentRoom.difficulty || 'medium');
      return;
    }

    // If no code and no current room, show mode setup
    if (!code && !currentRoom) {
      setShowModeSetup(true);
      setLoading(false);
      return;
    }

    // Online mode - use socket
    if (!socket || !user || !code) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Join game room via Socket
    socket.emit('joinGame', {
      roomCode: code,
      userId: user.id,
      gameType: 'teen-patti',
      username: user.user_metadata?.username || 'Player',
    });

    // Listen for game state updates
    const handleGameState = (state: TeenPattiGameState) => {
      setGameState(state);
      setLoading(false);
    };

    // Listen for game updates
    const handleGameUpdate = (update: Partial<TeenPattiGameState>) => {
      setGameState((prev) => (prev ? { ...prev, ...update } : null));
    };

    const handleError = (errorMsg: string) => {
      setError(errorMsg);
      setTimeout(() => navigate('/'), 3000);
    };

    socket.on('gameState', handleGameState);
    socket.on('gameUpdate', handleGameUpdate);
    socket.on('error', handleError);

    return () => {
      socket.off('gameState', handleGameState);
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('error', handleError);
    };
  }, [socket, user, code, setGameState, currentRoom, gameState, initializeOfflineGame, navigate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassPanel className="p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-xs text-muted-foreground">Redirecting...</p>
        </GlassPanel>
      </div>
    );
  }

  if (showModeSetup && !currentRoom?.botPlayers) {
    return (
      <GameModeSetup
        onModeSelected={handleModeSelected}
        onCancel={() => navigate('/lobby')}
      />
    );
  }

  if (loading || !gameState || gameState.type !== 'teen-patti') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full"
        />
      </div>
    );
  }

  return (
    <TeenPattiTable
      gameState={gameState}
      currentUserId={user?.id || ''}
      onAction={handleGameAction}
      isOfflineMode={isOffline}
      thinkingBots={Array.from(thinkingBots)}
    />
  );
}
