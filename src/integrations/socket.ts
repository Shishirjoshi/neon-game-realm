import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(url: string = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001') {
  if (socket) return socket;

  socket = io(url, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default socket;
