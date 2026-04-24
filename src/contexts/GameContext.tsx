import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface GamePlayer {
  id: string;
  username: string;
  avatar_url?: string | null;
  seat: number;
  isReady: boolean;
  coinBalance?: number;
  status: 'idle' | 'playing' | 'folded' | 'won' | 'lost';
}

export interface TeenPattiGameState {
  type: 'teen-patti';
  players: GamePlayer[];
  currentPlayerTurn?: string;
  communityCards: string[];
  pot: number;
  minimumBet: number;
  yourCards: string[];
  yourSeat: number;
  gamePhase: 'waiting' | 'dealing' | 'playing' | 'showdown' | 'completed';
  roundHistory?: {
    winner: string;
    pot: number;
    timestamp: number;
  }[];
}

export interface TypingGameState {
  type: 'typing';
  players: GamePlayer[];
  textToType: string;
  leaderboard: Array<{
    userId: string;
    username: string;
    wpm: number;
    progress: number;
    accuracy: number;
  }>;
  yourProgress: number;
  yourWPM: number;
  yourAccuracy: number;
  gamePhase: 'waiting' | 'counting' | 'active' | 'completed';
  timeRemaining?: number;
}

export type GameState = TeenPattiGameState | TypingGameState | null;

interface GameContextType {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  updateGameState: (updates: Partial<GameState>) => void;
  resetGameState: () => void;
  updatePlayer: (userId: string, updates: Partial<GamePlayer>) => void;
  currentRoom: {
    code: string;
    gameType: string;
    hostId: string;
    maxPlayers: number;
    botPlayers?: any[];
  } | null;
  setCurrentRoom: (room: any) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(null);
  const [currentRoom, setCurrentRoom] = useState<any>(null);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const resetGameState = useCallback(() => {
    setGameState(null);
  }, []);

  const updatePlayer = useCallback((userId: string, updates: Partial<GamePlayer>) => {
    setGameState((prev) => {
      if (!prev || !('players' in prev)) return prev;
      return {
        ...prev,
        players: prev.players.map((p) =>
          p.id === userId ? { ...p, ...updates } : p
        ),
      };
    });
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        updateGameState,
        resetGameState,
        updatePlayer,
        currentRoom,
        setCurrentRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within GameProvider');
  }
  return context;
}
