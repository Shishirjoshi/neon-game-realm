/**
 * TEEN PATTI GAME LOGIC
 */

// ========================================
// CARD OPERATIONS
// ========================================

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  
  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function dealCards(players, deck) {
  let idx = 0;
  players.forEach((p) => {
    p.hand = [deck[idx++], deck[idx++], deck[idx++]];
  });
}

// ========================================
// HAND RANKING
// ========================================

function getRankValue(rank) {
  const map = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
  return map[rank] || 0;
}

function evaluateHand(hand) {
  const ranks = hand.map(c => getRankValue(c.rank)).sort((a, b) => b - a);
  const suits = hand.map(c => c.suit);
  
  // Check trio
  if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
    return { type: 'trio', value: 5, high: ranks[0] };
  }
  
  // Check sequence
  if (ranks[0] - ranks[1] === 1 && ranks[1] - ranks[2] === 1) {
    return { type: 'sequence', value: 4, high: ranks[0] };
  }
  
  // Check color
  if (suits[0] === suits[1] && suits[1] === suits[2]) {
    return { type: 'color', value: 3, high: ranks[0] };
  }
  
  // Check pair
  if (ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2]) {
    const pairRank = ranks[0] === ranks[1] ? ranks[0] : ranks[2];
    return { type: 'pair', value: 2, high: pairRank };
  }
  
  // High card
  return { type: 'highcard', value: 1, high: ranks[0] };
}

function getWinner(players) {
  const active = players.filter(p => !p.folded && p.hand && p.hand.length === 3);
  if (active.length === 0) return null;
  
  let winner = active[0];
  for (let i = 1; i < active.length; i++) {
    const eval1 = evaluateHand(winner.hand);
    const eval2 = evaluateHand(active[i].hand);
    
    if (eval2.value > eval1.value || (eval2.value === eval1.value && eval2.high > eval1.high)) {
      winner = active[i];
    }
  }
  
  return winner;
}

// ========================================
// GAME MANAGER
// ========================================

export class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(hostId, hostName) {
    const roomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    
    const room = {
      roomId,
      hostId,
      players: [
        { id: hostId, name: hostName, coins: 1000, hand: [], folded: false, currentBet: 0 }
      ],
      pot: 0,
      currentTurn: 0,
      state: 'waiting' // waiting | playing | finished
    };
    
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId, playerId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    if (room.players.find(p => p.id === playerId)) return room; // Already in room
    
    room.players.push({
      id: playerId,
      name: playerName,
      coins: 1000,
      hand: [],
      folded: false,
      currentBet: 0
    });
    
    return room;
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return null;
    
    room.state = 'playing';
    room.pot = 0;
    room.currentTurn = 0;
    
    // Reset players
    room.players.forEach(p => {
      p.hand = [];
      p.folded = false;
      p.currentBet = 0;
    });
    
    // Deal cards
    const deck = shuffleDeck(createDeck());
    dealCards(room.players, deck);
    
    return room;
  }

  playerAction(roomId, playerId, action) {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'playing') return null;
    
    const player = room.players.find(p => p.id === playerId);
    if (!player || player.folded) return null;
    
    const currentPlayer = room.players[room.currentTurn];
    if (currentPlayer.id !== playerId) return null;
    
    if (action === 'bet') {
      if (player.coins >= 10) {
        player.coins -= 10;
        player.currentBet += 10;
        room.pot += 10;
      }
    } else if (action === 'fold') {
      player.folded = true;
    }
    
    // Check if game ends
    const activePlayers = room.players.filter(p => !p.folded);
    if (activePlayers.length === 1) {
      room.state = 'finished';
      const winner = activePlayers[0];
      winner.coins += room.pot;
      room.winner = winner.name;
      return room;
    }
    
    // Next turn
    room.currentTurn = (room.currentTurn + 1) % room.players.length;
    while (room.players[room.currentTurn].folded) {
      room.currentTurn = (room.currentTurn + 1) % room.players.length;
    }
    
    return room;
  }
}
