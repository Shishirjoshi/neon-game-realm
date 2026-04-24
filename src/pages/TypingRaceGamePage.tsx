import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '@/contexts/SocketContext';
import { useGameState } from '@/contexts/GameContext';
import { useAuth } from '@/hooks/useAuth';
import { TypingRaceGame } from '@/components/TypingRaceGame';
import { GlassPanel } from '@/components/GlassPanel';
import type { TypingGameState } from '@/contexts/GameContext';

export default function TypingRaceGamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const { gameState, setGameState } = useGameState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize game connection
  useEffect(() => {
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
      setError(errorMsg);
      setTimeout(() => navigate('/'), 3000);
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
  }, [socket, user, code, setGameState, navigate]);

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
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-xs text-muted-foreground">Redirecting...</p>
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
