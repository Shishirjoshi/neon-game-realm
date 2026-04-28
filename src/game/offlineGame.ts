import { useState } from "react";

/* ================= BOT ENGINE ================= */

/**
 * Get bot thinking delay (human-like feel)
 */
function getBotDelay(): number {
  return 500 + Math.random() * 1000;
}

/**
 * Evaluate hand strength (simple 3-level system)
 */
function evaluateHandStrength(hand: any[]): "high" | "medium" | "low" {
  if (!hand || hand.length !== 3) return "low";

  const values = hand.map((c) => c.v);
  const unique = new Set(values);

  if (unique.size === 1) return "high"; // trio
  if (unique.size === 2) return "medium"; // pair
  return "low";
}

/**
 * Bot decision logic based on difficulty
 */
function decideBotAction(bot: any, room: any): "bet" | "fold" | "call" | null {
  const player = room.players.find((p: any) => p.id === bot.id);
  if (!player || player.folded) return null;

  const strength = evaluateHandStrength(player.hand);

  switch (bot.type) {
    // 🟢 EASY BOT - Random, conservative
    case "easy":
      return Math.random() < 0.7 ? "fold" : "bet";

    // 🟡 MEDIUM BOT - Slightly smarter
    case "medium":
      if (strength === "high") return "bet";
      if (strength === "medium") return Math.random() < 0.7 ? "bet" : "fold";
      return Math.random() < 0.4 ? "bet" : "fold";

    // 🔴 HARD BOT - Intelligent, strategic
    case "hard":
      if (strength === "high") return "bet";
      if (strength === "medium") return Math.random() < 0.85 ? "bet" : "fold";
      return Math.random() < 0.2 ? "bet" : "fold";

    default:
      return "call";
  }
}

/* ================= GAME ENGINE ================= */

interface Player {
  id: string;
  name: string;
  coins: number;
  hand: any[];
  folded: boolean;
  isBot: boolean;
  type?: "easy" | "medium" | "hard";
}

interface Room {
  roomId: string;
  pot: number;
  currentTurn: number;
  state: "playing" | "finished";
  players: Player[];
  winner?: string;
  minBet?: number;
}

let room: Room | null = null;

/**
 * Create offline game with human player and AI bots
 */
export function createOfflineGame(
  playerName: string = "You",
  botCount: number = 2
): Room {
  room = {
    roomId: "LOCAL",
    pot: 0,
    currentTurn: 0,
    state: "playing",
    players: [],
    minBet: 10,
  };

  // Human player
  room.players.push({
    id: "player",
    name: playerName,
    coins: 1000,
    hand: [],
    folded: false,
    isBot: false,
  });

  // AI Bots
  const botTypes: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];
  for (let i = 0; i < botCount; i++) {
    room.players.push({
      id: `bot_${i}`,
      name: `Bot ${i + 1}`,
      coins: 1000,
      hand: [],
      folded: false,
      isBot: true,
      type: botTypes[i % 3],
    });
  }

  dealCards();
  return room;
}

/**
 * Deal cards to all players
 */
function dealCards(): void {
  if (!room) return;

  const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

  room.players.forEach((p) => {
    p.hand = [
      { v: values[Math.floor(Math.random() * 13)] },
      { v: values[Math.floor(Math.random() * 13)] },
      { v: values[Math.floor(Math.random() * 13)] },
    ];
  });
}

/**
 * Move to next player's turn
 */
function nextTurn(): void {
  if (!room) return;

  do {
    room.currentTurn = (room.currentTurn + 1) % room.players.length;
  } while (room.players[room.currentTurn].folded);
}

/**
 * Execute bot turn automatically
 */
function runBotTurn(bot: Player): void {
  setTimeout(() => {
    const action = decideBotAction(bot, room);
    if (action) {
      handleAction(bot.id, action);
    }
  }, getBotDelay());
}

/**
 * Main action handler - processes player/bot actions
 */
export function handleAction(
  playerId: string,
  action: "bet" | "fold" | "call" | "check"
): Room | null {
  if (!room) return null;

  const player = room.players[room.currentTurn];

  if (player.id !== playerId) return room;

  if (action === "bet") {
    const betAmount = room.minBet || 10;
    if (player.coins >= betAmount) {
      player.coins -= betAmount;
      room.pot += betAmount;
    }
  }

  if (action === "fold") {
    player.folded = true;
  }

  // Check if game is over (only 1 player left)
  const active = room.players.filter((p) => !p.folded);
  if (active.length === 1) {
    room.state = "finished";
    room.winner = active[0].name;
    active[0].coins += room.pot;
    return room;
  }

  // Next turn
  nextTurn();

  const next = room.players[room.currentTurn];
  if (next && next.isBot) {
    runBotTurn(next);
  }

  return room;
}

/**
 * Get current game state
 */
export function getRoom(): Room | null {
  return room;
}

/**
 * Reset game
 */
export function resetGame(): void {
  room = null;
}

/* ================= REACT HOOK (UI INTEGRATION) ================= */

export interface OfflineGameState {
  game: Room | null;
  start: (playerName?: string, botCount?: number) => void;
  action: (type: "bet" | "fold" | "call" | "check") => void;
  reset: () => void;
  currentPlayer: Player | null;
  winner: string | null;
  isGameActive: boolean;
}

/**
 * React hook for using offline game in components
 */
export function useOfflineGame(): OfflineGameState {
  const [game, setGame] = useState<Room | null>(null);

  function start(playerName: string = "You", botCount: number = 2) {
    const g = createOfflineGame(playerName, botCount);
    setGame({ ...g });

    // Start first bot turn if applicable
    const currentPlayer = g.players[g.currentTurn];
    if (currentPlayer?.isBot) {
      setTimeout(() => runBotTurn(currentPlayer), getBotDelay());
    }
  }

  function action(type: "bet" | "fold" | "call" | "check") {
    const updated = handleAction("player", type);
    if (updated) {
      setGame({ ...updated });
    }
  }

  function reset() {
    resetGame();
    setGame(null);
  }

  return {
    game,
    start,
    action,
    reset,
    currentPlayer: game ? game.players[game.currentTurn] : null,
    winner: game?.winner || null,
    isGameActive: game?.state === "playing",
  };
}
