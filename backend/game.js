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
  if (!hand || hand.length !== 3) return { type: 'invalid', value: 0, high: 0 };
  
  const ranks = hand.map(c => getRankValue(c.rank)).sort((a, b) => b - a);
  const suits = hand.map(c => c.suit);
  
  // Check Trio (highest rank)
  if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
    return { type: 'trio', value: 5, high: ranks[0], description: `Trio of ${hand[0].rank}s` };
  }
  
  // Check Sequence (straight)
  if (ranks[0] - ranks[1] === 1 && ranks[1] - ranks[2] === 1) {
    return { type: 'sequence', value: 4, high: ranks[0], description: `Sequence ${ranks[0]}-${ranks[1]}-${ranks[2]}` };
  }
  
  // Check Color (flush - all same suit)
  if (suits[0] === suits[1] && suits[1] === suits[2]) {
    return { type: 'color', value: 3, high: ranks[0], description: `Color (all ${suits[0]})` };
  }
  
  // Check Pair
  if (ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2]) {
    const pairRank = ranks[0] === ranks[1] ? ranks[0] : (ranks[1] === ranks[2] ? ranks[1] : ranks[0]);
    return { type: 'pair', value: 2, high: pairRank, description: `Pair of ${Object.entries({2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13,A:14}).find(([k,v]) => v === pairRank)?.[0]}s` };
  }
  
  // High Card (lowest rank)
  return { type: 'highcard', value: 1, high: ranks[0], description: `High Card ${ranks.join('-')}` };
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
        { 
          id: hostId, 
          name: hostName, 
          coins: 1000, 
          hand: [], 
          folded: false, 
          currentBet: 0,
          hasPlayed: false // Track if player has acted this round
        }
      ],
      pot: 0,
      currentTurn: 0,
      state: 'waiting', // waiting | playing | showdown | finished
      round: 0,
      turnCount: 0, // Track how many players have taken turns
      roundStarted: false,
      deck: []
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
      currentBet: 0,
      hasPlayed: false
    });
    
    return room;
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return null;
    
    room.state = 'playing';
    room.pot = 0;
    room.currentTurn = 0;
    room.round = 1;
    room.turnCount = 0;
    room.roundStarted = true;
    
    // Reset players
    room.players.forEach(p => {
      p.hand = [];
      p.folded = false;
      p.currentBet = 0;
      p.hasPlayed = false;
    });
    
    // Deal cards
    room.deck = shuffleDeck(createDeck());
    dealCards(room.players, room.deck);
    
    return room;
  }

  playerAction(roomId, playerId, action) {
    const room = this.rooms.get(roomId);
    if (!room || !['playing', 'showdown'].includes(room.state)) return null;
    
    const player = room.players.find(p => p.id === playerId);
    if (!player || player.folded) return null;
    
    const currentPlayer = room.players[room.currentTurn];
    if (currentPlayer.id !== playerId) return null;
    
    // Handle BET action
    if (action === 'bet') {
      const betAmount = 10; // Fixed bet
      if (player.coins >= betAmount) {
        player.coins -= betAmount;
        player.currentBet += betAmount;
        room.pot += betAmount;
      } else {
        return null; // Not enough coins
      }
    } 
    // Handle FOLD action
    else if (action === 'fold') {
      player.folded = true;
    }
    // Handle SHOW action (for multiplayer rounds)
    else if (action === 'show') {
      player.hasPlayed = true;
    }
    
    player.hasPlayed = true;
    room.turnCount++;
    
    // Check if game ends (only 1 player left)
    const activePlayers = room.players.filter(p => !p.folded);
    if (activePlayers.length === 1) {
      room.state = 'finished';
      const winner = activePlayers[0];
      winner.coins += room.pot;
      room.winner = {
        id: winner.id,
        name: winner.name,
        coins: winner.coins,
        reason: 'All other players folded'
      };
      return room;
    }
    
    // Move to next turn (skip folded players)
    this.advanceTurn(room);
    
    // Check if all active players have played
    const allHavePlayed = activePlayers.every(p => p.hasPlayed);
    if (allHavePlayed && room.turnCount >= activePlayers.length) {
      // Move to showdown
      room.state = 'showdown';
      return this.resolveShowdown(room);
    }
    
    return room;
  }

  advanceTurn(room) {
    room.currentTurn = (room.currentTurn + 1) % room.players.length;
    
    // Skip folded players
    while (room.players[room.currentTurn].folded) {
      room.currentTurn = (room.currentTurn + 1) % room.players.length;
    }
  }

  resolveShowdown(room) {
    const activePlayers = room.players.filter(p => !p.folded);
    
    if (activePlayers.length === 0) return room;
    
    // Find winner by hand strength
    let winner = activePlayers[0];
    let winningHand = evaluateHand(winner.hand);
    
    for (let i = 1; i < activePlayers.length; i++) {
      const hand = evaluateHand(activePlayers[i].hand);
      
      if (hand.value > winningHand.value || 
          (hand.value === winningHand.value && hand.high > winningHand.high)) {
        winner = activePlayers[i];
        winningHand = hand;
      }
    }
    
    // Award pot to winner
    winner.coins += room.pot;
    room.state = 'finished';
    room.winner = {
      id: winner.id,
      name: winner.name,
      coins: winner.coins,
      hand: winner.hand,
      handType: winningHand.type,
      handDescription: winningHand.description,
      reason: 'Best hand'
    };
    
    return room;
  }
}
