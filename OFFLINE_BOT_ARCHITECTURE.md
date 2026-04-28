/**
 * OFFLINE MODE + AI BOT SYSTEM - ARCHITECTURE DOCUMENTATION
 * 
 * Complete guide to the offline gaming and bot system implementation
 */

# Offline Mode + AI Bot System

## Overview

This system enables offline gameplay with AI bots for multiplayer games. Users can play without internet by competing against difficulty-configurable AI opponents.

## Core Components

### 1. **Local Game Engine** (`src/lib/localGameEngine.ts`)
Main orchestrator for offline games.

**Responsibilities:**
- Manage offline room state (players, pot, turns)
- Deal cards and manage deck
- Process player actions (human & bot)
- Simulate bot turns with realistic delays
- Emit state updates to UI

**Key Methods:**
```typescript
startGame()                    // Initialize and start game
setBotDifficulty()            // Set difficulty for specific bot
handlePlayerAction()          // Process human or bot actions
processNextTurn()            // Advance turn to next active player
executeBotTurn()             // Handle bot decision and execution
```

---

### 2. **Hand Evaluator** (`src/lib/teenpatti/handEvaluator.ts`)
Teen Patti-specific hand ranking and strength evaluation.

**Hands (Ranked Highest → Lowest):**
1. **Trio** - Three cards of same rank
2. **Pure Sequence** - Consecutive ranks, same suit
3. **Sequence** - Consecutive ranks, mixed suits  
4. **Color** - All same suit
5. **Pair** - Two cards of same rank
6. **High Card** - No combinations

**Key Functions:**
```typescript
evaluateHand(hand: Card[])           // Full hand analysis with type & rank
getHandStrength(hand)                // Simple "high|medium|low"
getWinProbability(hand)              // Estimated win probability (0-1)
compareHands(hand1, hand2)           // Compare two hands
```

---

### 3. **Bot Logic** (`src/lib/teenpatti/botLogic.ts`)
Difficulty-based decision making for bots.

**Difficulties:**

#### Easy Bot (Loose, Timid)
- 65% fold, 25% call, 10% raise
- No hand strength consideration
- Great for learning players

#### Medium Bot (Balanced)
- Considers hand strength
- 40% fold strong hand, 30% call, varies on hand type
- Moderate risk-taking
- Good for casual play

#### Hard Bot (Smart, Strategic)
- Evaluates hand strength deeply
- Aggressive with strong hands
- Folds weak hands vs aggression
- Considers pot size and player count
- Challenging for experienced players

**Key Functions:**
```typescript
getBotDecision()       // Returns action + confidence + reasoning
getBotThinkDelay()     // Realistic pause (300-2000ms by difficulty)
```

---

### 4. **Enhanced Bot Service** (`src/lib/botService.ts`)
Utility functions for bot creation and management.

**Functions:**
```typescript
createBotPlayers(count, startSeat, difficulty)
getDifficultyLabel(difficulty)
getDifficultyDescription(difficulty)
getBotTypingSpeed(difficulty)              // For other games
```

---

### 5. **UI Components**

#### GameModeSetup (`src/components/GameModeSetup.tsx`)
Modal for selecting offline/online and bot configuration.

**Features:**
- Mode selection (Online | Offline)
- Bot count selector (1-3 bots)
- Difficulty picker
- Configuration summary

#### BotIndicator (`src/components/BotIndicator.tsx`)
Visual indicator for bot players in game.

**Shows:**
- Bot name with 🤖 icon
- Difficulty badge (Easy/Medium/Hard)
- Thinking animation when taking turn
- Active turn indicator

---

## Game Flow

### Offline Game Initialization

```
User clicks "Play Offline"
        ↓
GameModeSetup modal shown
        ↓
Select bots (1-3) and difficulty
        ↓
Create bot players with GameContext
        ↓
LocalGameEngine initialized with all players
        ↓
Game state created and UI updated
        ↓
startGame() called after 1s delay
```

### Turn Processing

```
processNextTurn()
        ↓
Find next active player (not folded)
        ↓
Update game state with current turn
        ↓
If human player: Wait for UI input
   OR
If bot player: 
    ├─ Generate random delay (500-2000ms)
    ├─ Evaluate hand and game context
    ├─ Determine action via getBotDecision()
    ├─ Execute action
    └─ Process next turn
```

---

## Data Structures

### LocalRoom
```typescript
{
  roomId: "LOCAL-timestamp"
  gameType: "teen-patti" | "typing" | "other"
  players: GamePlayer[]           // Human + bots
  currentTurnIndex: number        // Index in players array
  pot: number                     // Total chips wagered
  minBet: number                  // Minimum bet allowed
  currentBet: number              // Current bet amount
  gamePhase: "waiting|dealing|playing|showdown|completed"
  round: number                   // Current round
  deck: Card[]                    // Remaining cards
  playerHands: Record<playerId, Card[]>
}
```

### BotPlayer (extends GamePlayer)
```typescript
{
  id: string
  username: string               // Bot name (Nova, Cipher, etc)
  seat: number
  coinBalance: number           // Starting: 1000
  status: "playing" | "folded"
  isBot: true
  difficulty?: "easy" | "medium" | "hard"
}
```

### BotDecision
```typescript
{
  action: "fold" | "call" | "raise" | "check"
  amount: number                // Chips to wager
  confidence: number            // 0-1 confidence score
  reasoning: string             // Why this action
}
```

---

## Integration with Existing Code

### TeenPattiGame Component

**Props passed to TeenPattiTable:**
```typescript
{
  gameState: TeenPattiGameState
  currentUserId: string
  onAction: (action, amount?) => void
  isOfflineMode: boolean                    // NEW
  thinkingBots: string[]                   // NEW - bot IDs currently thinking
}
```

**How it works:**
1. If offline: Uses `LocalGameEngine` to process actions
2. If online: Uses Socket.IO as before
3. Same UI works for both modes

---

## Extensibility

### Adding a New Game Type

1. **Create game-specific module:**
   ```typescript
   src/lib/yourGame/handEvaluator.ts  // If needed
   src/lib/yourGame/botLogic.ts       // Difficulty-based decisions
   ```

2. **Update botService.ts:**
   ```typescript
   export function getBotDecisionYourGame(difficulty) {
     // Your game logic
   }
   ```

3. **Create engine instance in game component:**
   ```typescript
   const engine = new LocalGameEngine('your-game', allPlayers, callbacks)
   ```

### Example: Typing Race Bot

```typescript
// src/lib/typingRace/botLogic.ts
export function getTypingBotSpeed(difficulty: BotDifficulty) {
  switch(difficulty) {
    case 'easy': return { wpm: 40-60, accuracy: 85-95% }
    case 'medium': return { wpm: 60-80, accuracy: 90-98% }
    case 'hard': return { wpm: 80-100, accuracy: 94-99% }
  }
}
```

---

## Key Features

✅ **Offline Play** - No internet required  
✅ **Multiple Difficulties** - Easy, Medium, Hard  
✅ **Realistic Behavior** - Think delays, hand evaluation  
✅ **Reusable Architecture** - Works for any game  
✅ **Clean Separation** - Bot logic isolated from UI  
✅ **Type-Safe** - Full TypeScript support  
✅ **Extensible** - Easy to add new games  
✅ **Same UI** - Online/offline use identical UI  

---

## Future Enhancements

1. **Persistence** - Save offline game progress
2. **Statistics** - Track wins/losses vs bots
3. **Balancing** - Adjust bot difficulty based on performance
4. **More Games** - Extend to Typing, Racing, etc.
5. **Bluffing** - Advanced bot strategies
6. **Learning** - Bots that adapt to player style

---

## Testing the System

### Manual Testing Checklist

- [ ] Start offline game with 1 bot (Easy)
- [ ] Start offline game with 3 bots (Medium)
- [ ] Start offline game with 1 bot (Hard)
- [ ] Verify bot actions appear after realistic delays
- [ ] Verify hand strengths are evaluated correctly
- [ ] Test human player action execution
- [ ] Verify game state updates UI correctly
- [ ] Test cleanup on page exit
- [ ] Verify online mode still works (socket)

---

## API Reference

### LocalGameEngine

```typescript
constructor(
  gameType: 'teen-patti' | 'typing' | 'other',
  players: GamePlayer[],
  callbacks?: GameEngineCallbacks
)

startGame(): void
setBotDifficulty(playerId, difficulty): void
handlePlayerAction(playerId, action, amount?): void
getGameState(): LocalRoom
reset(): void
destroy(): void
```

### Hand Evaluator

```typescript
evaluateHand(hand: Card[]): HandEvaluation
compareHands(hand1: Card[], hand2: Card[]): number  // -1|0|1
getHandStrength(hand: Card[]): HandStrength
getWinProbability(hand: Card[]): number             // 0-1
```

### Bot Logic

```typescript
getBotDecision(
  difficulty: BotDifficulty,
  hand: Card[],
  context: GameContext,
  playerCoins: number
): BotDecision

getBotThinkDelay(difficulty: BotDifficulty): number
```

---

## Performance Considerations

- **Card Deck**: Cached and reused per game, not recreated
- **Hand Evaluation**: O(1) complexity (always 3 cards)
- **Decision Making**: ~50ms max computation
- **UI Updates**: Batched via React state
- **Memory**: Cleaned up on component unmount

---

## Security Notes

- All game logic is client-side (offline mode)
- No cheating prevention needed (single player)
- Online mode still uses server validation (via Socket.IO)
- Bot "thinking" is purely visual - no actual delays in calculations

