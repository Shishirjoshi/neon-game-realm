import { Socket } from 'socket.io-client';
import type { TeenPattiGameState, TypingGameState } from '@/contexts/GameContext';

export interface SocketEmitters {
  // Room events
  createRoom: (data: {
    gameType: string;
    hostId: string;
  }) => void;
  joinGame: (data: {
    roomCode: string;
    userId: string;
    username: string;
    gameType: string;
  }) => void;
  leaveGame: (data: { roomCode: string; userId: string }) => void;
  startGame: (data: { roomCode: string; hostId: string }) => void;

  // Teen Patti events
  gameAction: (data: {
    roomCode: string;
    userId: string;
    action: 'fold' | 'call' | 'raise' | 'show';
    amount: number;
  }) => void;

  // Typing game events
  typingUpdate: (data: {
    roomCode: string;
    userId: string;
    text: string;
    wpm: number;
    accuracy: number;
    progress: number;
  }) => void;
}

export interface SocketListeners {
  // Connection
  connect: () => void;
  disconnect: () => void;
  error: (error: string) => void;

  // Game state
  gameState: (state: TeenPattiGameState | TypingGameState) => void;
  gameUpdate: (update: Partial<TeenPattiGameState | TypingGameState>) => void;
  gameStarted: (data: { gameType: string; roomCode: string }) => void;

  // Player events
  playerJoined: (data: { userId: string; username: string; seat: number }) => void;
  playerLeft: (data: { userId: string }) => void;
  playerAction: (data: {
    playerId: string;
    action: string;
    amount?: number;
  }) => void;

  // Typing specific
  leaderboardUpdate: (leaderboard: Array<{
    userId: string;
    username: string;
    wpm: number;
    progress: number;
    accuracy: number;
  }>) => void;

  // Room events
  roomUpdated: (data: any) => void;
}

export function setupSocketEmitters(socket: Socket): SocketEmitters {
  return {
    createRoom: (data) => socket.emit('createRoom', data),
    joinGame: (data) => socket.emit('joinGame', data),
    leaveGame: (data) => socket.emit('leaveGame', data),
    startGame: (data) => socket.emit('startGame', data),
    gameAction: (data) => socket.emit('gameAction', data),
    typingUpdate: (data) => socket.emit('typingUpdate', data),
  };
}

export function setupSocketListeners(
  socket: Socket,
  handlers: Partial<Record<keyof SocketListeners, Function>>
) {
  Object.entries(handlers).forEach(([event, handler]) => {
    if (handler) {
      socket.on(event, handler as any);
    }
  });

  return () => {
    Object.entries(handlers).forEach(([event]) => {
      socket.off(event);
    });
  };
}
