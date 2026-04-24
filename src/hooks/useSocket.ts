import { useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { setupSocketEmitters, setupSocketListeners } from '@/lib/socketService';
import type { SocketEmitters, SocketListeners } from '@/lib/socketService';

export function useSocketEmit() {
  const { socket } = useSocket();

  return useCallback((event: string, data?: any) => {
    socket?.emit(event, data);
  }, [socket]);
}

export function useSocketListener<T extends keyof SocketListeners>(
  event: T,
  handler: (data: any) => void
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}

export function useSocketEvents(
  handlers: Partial<Record<keyof SocketListeners, Function>>
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    return setupSocketListeners(socket, handlers);
  }, [socket, handlers]);
}

export function useSocketEmitters(): SocketEmitters | null {
  const { socket } = useSocket();

  if (!socket) return null;

  return setupSocketEmitters(socket);
}
