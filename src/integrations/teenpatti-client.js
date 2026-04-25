/**
 * TEEN PATTI MVP - FRONTEND CLIENT INTEGRATION
 * Socket.IO client utilities for React
 */

import io from 'socket.io-client';

/**
 * SOCKET CLIENT CLASS
 * Manages socket connection and game events
 */
class TeenPattiClient {
  constructor(serverUrl = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.listeners = {};
  }

  /**
   * CONNECT TO SERVER
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          console.log('✓ Connected to server:', this.socket.id);
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * DISCONNECT FROM SERVER
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('✓ Disconnected from server');
    }
  }

  /**
   * CREATE ROOM
   */
  createRoom(hostName, roomName) {
    return new Promise((resolve, reject) => {
      this.socket.emit('createRoom', { hostName, roomName }, (response) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * JOIN ROOM
   */
  joinRoom(roomId, playerName, playerId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('joinRoom', { roomId, playerName, playerId }, (response) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * GET ROOM
   */
  getRoom(roomId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('getRoom', { roomId }, (response) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * GET ALL ROOMS
   */
  getAllRooms() {
    return new Promise((resolve, reject) => {
      this.socket.emit('getAllRooms', (response) => {
        if (response.success) {
          resolve(response.rooms);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * START GAME
   */
  startGame(roomId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('startGame', { roomId }, (response) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * PLAYER BET
   */
  bet(roomId, playerId, amount = 10) {
    return new Promise((resolve, reject) => {
      this.socket.emit('playerBet', { roomId, playerId, amount }, (response) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * PLAYER FOLD
   */
  fold(roomId, playerId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('playerFold', { roomId, playerId }, (response) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * FINISH BETTING ROUND (End game)
   */
  finishBettingRound(roomId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('finishBettingRound', { roomId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * RESET GAME (Start new round)
   */
  resetGame(roomId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('resetGame', { roomId }, (response) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * LEAVE ROOM
   */
  leaveRoom(roomId, playerId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('leaveRoom', { roomId, playerId }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * LISTEN TO EVENT
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    this.socket.on(event, callback);
  }

  /**
   * LISTEN TO EVENT (ONCE)
   */
  once(event, callback) {
    this.socket.once(event, callback);
  }

  /**
   * REMOVE LISTENER
   */
  off(event, callback) {
    this.socket.off(event, callback);
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  /**
   * REMOVE ALL LISTENERS
   */
  removeAllListeners() {
    Object.keys(this.listeners).forEach((event) => {
      this.listeners[event].forEach((callback) => {
        this.socket.off(event, callback);
      });
    });
    this.listeners = {};
  }
}

export default TeenPattiClient;
