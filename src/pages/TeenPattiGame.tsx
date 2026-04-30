import { useEffect, useState, useRef, useCallback } from 'react';
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
  
  // Track if we've already handled the offline code
  const offlineInitializedRef = useRef(false);

  /**
   * Handle bot action for UI updates
   */
  const handleBotAction = useCallback(
    (playerId: string, action: string, amount: number) => {
      // Clear thinking indicator for this bot
      setThinkingBots((prev) => {
        const next = new Set(prev);
        next.delete(playerId);
        return next;
      });
    },
    []
  );

  /**
   * Initialize offline game with bot players
   */
  const initializeOfflineGame = useCallback(
    (botPlayers: GamePlayer[], difficulty: BotDifficulty = 'medium') => {
      console.log('🎮 Initializing offline game with', botPlayers.length, 'bots at', difficulty, 'difficulty');
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

      console.log('👥 All players:', allPlayers.map(p => `${p.username}(${p.id})`).join(', '));

      // Create local game engine
      const engine = new LocalGameEngine('teen-patti', allPlayers, {
        onStateUpdate: (updates) => {
          console.log('🔄 Game state update:', updates);
          setGameState((prev) => {
            if (!prev) return null;
            const newState = { ...prev, ...updates };
            console.log('📊 New game state:', newState.gamePhase, 'Turn:', newState.currentPlayerTurn);
            return newState;
          });
        },
        onBotAction: (playerId, action, amount) => {
          console.log('🤖 Bot action:', action, 'amount:', amount);
          handleBotAction(playerId, action, amount);
        },
        onGameEnd: (winners) => {
          console.log('🏆 Game ended. Winners:', winners);
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
        currentPlayerTurn: humanPlayer.id,
        communityCards: [],
        pot: 0,
        minimumBet: 50,
        yourCards: [],
        yourSeat: 0,
        gamePhase: 'dealing',
        roundHistory: [],
      };

      console.log('📍 Setting initial game state');
      setGameState(initialState);
      setLoading(false);

      // Start game after delay
      console.log('⏱️ Starting game in 1000ms...');
      setTimeout(() => {
        console.log('🚀 Starting game engine');
        engine.startGame();
      }, 1000);
    },
    [user, setGameState, handleBotAction]
  );

  /**
   * Handle game mode selection
   */
  const handleModeSelected = useCallback(
    (
      mode: 'online' | 'offline',
      botCount?: number,
      difficulty?: BotDifficulty
    ) => {
      console.log('🎯 Mode selected:', mode, { botCount, difficulty });
      if (mode === 'offline' && botCount && difficulty) {
        console.log('✅ Creating offline game with', botCount, 'bots');
        const bots = createBotPlayers(botCount, 1, difficulty);
        initializeOfflineGame(bots, difficulty);
        setShowModeSetup(false);
      } else if (mode === 'online') {
        console.log('✅ Online mode selected');
        // Continue with online mode
        setShowModeSetup(false);
        setLoading(false);
      }
    },
    [initializeOfflineGame]
  );

  /**
   * Handle player action (for both online and offline)
   */
  const handleGameAction = useCallback(
    (action: 'fold' | 'call' | 'raise' | 'show', amount?: number) => {
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
    },
    [isOffline, user, socket, code]
  );

  // Initialize game - handle offline vs online
  useEffect(() => {
    console.log('🔧 TeenPattiGame init effect - code:', code, 'user:', user?.id, 'currentRoom:', currentRoom?.roomCode);

    // Offline mode: show setup if code is 'offline'
    if (code === 'offline') {
      console.log('📵 Offline mode detected');
      if (!offlineInitializedRef.current) {
        console.log('🎬 Starting offline initialization');
        offlineInitializedRef.current = true;
        setShowModeSetup(true);
        setLoading(false);
      }
      return;
    }

    // Reset offline ref when not in offline mode
    offlineInitializedRef.current = false;

    // Check if we already have bot players from context (from previous setup)
    if (currentRoom?.botPlayers && currentRoom.botPlayers.length > 0 && !gameState) {
      console.log('🤖 Found bot players in context, initializing offline game');
      initializeOfflineGame(currentRoom.botPlayers, currentRoom.difficulty || 'medium');
      return;
    }

    // Online mode - must have socket, user, and code
    if (!socket || !user || !code) {
      console.log('⏸️ Waiting for socket/user/code');
      setLoading(false);
      return;
    }

    console.log('🌐 Online mode - joining room:', code);
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
      console.log('📥 Game state received');
      setGameState(state);
      setLoading(false);
    };

    // Listen for game updates
    const handleGameUpdate = (update: Partial<TeenPattiGameState>) => {
      console.log('📤 Game update received');
      setGameState((prev) => (prev ? { ...prev, ...update } : null));
    };

    const handleError = (errorMsg: string) => {
      console.error('❌ Game error:', errorMsg);
      setError(errorMsg);
      // Don't auto-navigate, let user dismiss the error
    };

    socket.on('gameState', handleGameState);
    socket.on('gameUpdate', handleGameUpdate);
    socket.on('error', handleError);
    socket.on('connect_error', handleError);

    return () => {
      socket.off('gameState', handleGameState);
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('error', handleError);
      socket.off('connect_error', handleError);
    };
  }, [code, currentRoom, gameState, initializeOfflineGame, socket, user, setGameState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);

  if (error) {
    console.log('❌ Showing error UI:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassPanel className="p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => navigate('/lobby')}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Back to Lobby
            </button>
            <button
              onClick={() => { setError(null); setLoading(true); }}
              className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Retry
            </button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  if (showModeSetup && !currentRoom?.botPlayers) {
    console.log('🎮 Showing game mode setup modal');
    return (
      <GameModeSetup
        onModeSelected={handleModeSelected}
        onCancel={() => navigate('/lobby')}
      />
    );
  }

  if (loading || !gameState || gameState.type !== 'teen-patti') {
    console.log('⏳ Showing loading screen - loading:', loading, 'gameState:', !!gameState);
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

  console.log('✅ Showing game table');
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
