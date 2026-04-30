import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '@/contexts/SocketContext';
import { useGameState } from '@/contexts/GameContext';
import { useAuth } from '@/hooks/useAuth';
import { TypingRaceGame } from '@/components/TypingRaceGame';
import { GlassPanel } from '@/components/GlassPanel';
import { getBotTypingSpeed, simulateBotTypingProgress } from '@/lib/botService';
import type { TypingGameState } from '@/contexts/GameContext';

export default function TypingRaceGamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const { gameState, setGameState, currentRoom } = useGameState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize game with bots if offline
  useEffect(() => {
    if (currentRoom?.botPlayers && currentRoom.botPlayers.length > 0 && !gameState) {
      // Single player with bots - create game state locally
      const allPlayers = [
        {
          id: user?.id || 'player-1',
          username: user?.user_metadata?.username || 'You',
          avatar_url: null,
          seat: 0,
          isReady: true,
          status: 'playing' as const,
        },
        ...currentRoom.botPlayers.map((bot, i) => ({
          ...bot,
          seat: i + 1,
        }))
      ];

      // Create bot leaderboard entries with simulated speeds
      const leaderboard = allPlayers.map(p => {
        const botSpeed = p.seat > 0 ? getBotTypingSpeed('medium') : { wpm: 0, accuracy: 100 };
        return {
          userId: p.id,
          username: p.username,
          wpm: p.seat > 0 ? Math.floor(botSpeed.wpm) : 0,
          progress: 0,
          accuracy: p.seat > 0 ? Math.floor(botSpeed.accuracy) : 100
        };
      });

      const initialState: TypingGameState = {
        type: 'typing',
        players: allPlayers,
        textToType: 'The quick brown fox jumps over the lazy dog. Master your typing speed and accuracy to claim victory.',
        leaderboard,
        yourProgress: 0,
        yourWPM: 0,
        yourAccuracy: 100,
        gamePhase: 'waiting',
        timeRemaining: 60
      };

      setGameState(initialState);
      setLoading(false);
      return;
    }

    if (!socket || !user || !code) return;

    setLoading(true);

    // Join game room via Socket
    socket.emit('joinGame', { 
      roomCode: code, 
      userId: user.id, 
      gameType: 'typing',
      username: user.user_metadata?.username || 'Player'
    });

    // Listen for game state updates
    const handleGameState = (state: TypingGameState) => {
      setGameState(state);
      setLoading(false);
    };

    // Listen for game updates
    const handleGameUpdate = (update: Partial<TypingGameState>) => {
      setGameState((prev) => (prev ? { ...prev, ...update } : null));
    };

    // Listen for leaderboard updates
    const handleLeaderboardUpdate = (leaderboard: TypingGameState['leaderboard']) => {
      setGameState((prev) => 
        prev && prev.type === 'typing' ? { ...prev, leaderboard } : prev
      );
    };

    const handleError = (errorMsg: string) => {
      console.error('Game error:', errorMsg);
      setError(errorMsg);
    };

    socket.on('gameState', handleGameState);
    socket.on('gameUpdate', handleGameUpdate);
    socket.on('leaderboardUpdate', handleLeaderboardUpdate);
    socket.on('error', handleError);

    return () => {
      socket.off('gameState', handleGameState);
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('leaderboardUpdate', handleLeaderboardUpdate);
      socket.off('error', handleError);
    };
  }, [socket, user, code, setGameState, currentRoom, gameState, navigate]);

  const handleTyping = (text: string, wpm: number, accuracy: number) => {
    if (!socket || !user) return;

    socket.emit('typingUpdate', {
      roomCode: code,
      userId: user.id,
      text,
      wpm,
      accuracy,
      progress: text.length / (gameState as TypingGameState)?.textToType.length || 0,
    });
  };

  if (error) {
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

  if (loading || !gameState || gameState.type !== 'typing') {
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
    <TypingRaceGame
      gameState={gameState}
      currentUserId={user?.id || ''}
      onTyping={handleTyping}
    />
  );
}
