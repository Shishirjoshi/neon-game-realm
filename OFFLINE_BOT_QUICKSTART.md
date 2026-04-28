/**
 * OFFLINE MODE + BOT SYSTEM - QUICK START GUIDE
 */

# Quick Start: Offline Mode + Bots

## For End Users

### Play Against Bots

1. **Open a game** (Teen Patti, Typing Race, etc.)
2. **Select "Offline" mode** when prompted
3. **Choose bot count** (1-3 opponents)
4. **Select difficulty:**
   - 🟢 **Easy** - Learn the game, predictable opponent
   - 🟡 **Medium** - Balanced challenge
   - 🔴 **Hard** - Experienced player challenge
5. **Start playing!** Bots take turns automatically

---

## For Developers

### 1. Enable Offline Mode in Your Game Component

```typescript
import { GameModeSetup } from '@/components/GameModeSetup';
import { LocalGameEngine } from '@/lib/localGameEngine';

export function MyGame() {
  const [showModeSetup, setShowModeSetup] = useState(false);

  const handleModeSelected = (mode, botCount, difficulty) => {
    if (mode === 'offline') {
      // Create bots
      const bots = createBotPlayers(botCount, 0, difficulty);
      
      // Initialize engine
      const engine = new LocalGameEngine('teen-patti', [humanPlayer, ...bots], {
        onStateUpdate: (state) => setGameState(state),
        onBotAction: (playerId, action, amount) => console.log('Bot acted'),
        onGameEnd: (winners) => console.log('Game ended', winners),
      });

      engine.startGame();
    }
  };

  return (
    <>
      <GameModeSetup onModeSelected={handleModeSelected} />
      {/* Your game UI */}
    </>
  );
}
```

---

### 2. Handle Player Actions

```typescript
// Same handler for both online & offline!
const handlePlayerAction = (action, amount) => {
  if (isOffline && gameEngine) {
    // Offline: Use local engine
    gameEngine.handlePlayerAction(userId, action, amount);
  } else {
    // Online: Use socket
    socket.emit('gameAction', { action, amount, ... });
  }
};
```

---

### 3. Add Bot Difficulty Support to UI

```typescript
import { BotIndicator } from '@/components/BotIndicator';

// In your game table/component
{gameState.players.map(player => (
  player.isBot ? (
    <BotIndicator
      key={player.id}
      botName={player.username}
      difficulty={player.difficulty}
      isActive={gameState.currentPlayerTurn === player.id}
      isThinking={thinkingBots.includes(player.id)}
    />
  ) : (
    <PlayerDisplay player={player} />
  )
))}
```

---

## File Structure

```
src/
├── lib/
│   ├── localGameEngine.ts              ← Main offline engine
│   ├── botService.ts                   ← Bot utilities
│   └── teenpatti/
│       ├── handEvaluator.ts           ← Hand ranking
│       └── botLogic.ts                ← Bot decisions
│
├── components/
│   ├── GameModeSetup.tsx              ← Mode selector modal
│   └── BotIndicator.tsx               ← Bot visual indicator
│
└── pages/
    └── TeenPattiGame.tsx              ← Game page (both modes)
```

---

## API Quick Reference

### Create Offline Game

```typescript
import { LocalGameEngine } from '@/lib/localGameEngine';
import { createBotPlayers } from '@/lib/botService';

// Create 2 easy bots
const bots = createBotPlayers(2, 1, 'easy');

// Create engine
const engine = new LocalGameEngine('teen-patti', [human, ...bots], {
  onStateUpdate: (state) => updateUI(state),
  onBotAction: (id, action, amount) => handleBotAction(id, action),
});

// Start game
engine.startGame();

// Handle player action
engine.handlePlayerAction(playerId, 'fold');
engine.handlePlayerAction(playerId, 'raise', 100);
```

---

### Evaluate Hand Strength

```typescript
import { evaluateHand, getWinProbability, getHandStrength } from '@/lib/teenpatti/handEvaluator';

const hand = [
  { rank: 'A', suit: 'hearts' },
  { rank: 'K', suit: 'diamonds' },
  { rank: 'Q', suit: 'clubs' },
];

const eval = evaluateHand(hand);
// {
//   type: 'sequence',
//   strength: 'high',
//   rank: 7,
//   highCard: 14,
//   description: 'Pure Sequence (A-K-Q)'
// }

const strength = getHandStrength(hand);     // 'high'
const winProb = getWinProbability(hand);    // 0.75
```

---

### Get Bot Decision

```typescript
import { getBotDecision, getBotThinkDelay } from '@/lib/teenpatti/botLogic';

const decision = getBotDecision('hard', hand, {
  currentBet: 50,
  minBet: 10,
  pot: 200,
  playersRemaining: 3,
  round: 1,
}, playerBalance);

// {
//   action: 'raise',
//   amount: 150,
//   confidence: 0.8,
//   reasoning: 'Hard bot: Strong hand aggressive raise'
// }

const thinkMs = getBotThinkDelay('hard');  // 800-2000ms
```

---

## Common Tasks

### Task 1: Add Offline Mode to Your Game

```typescript
// In your game page
const [isOffline, setIsOffline] = useState(false);
const engineRef = useRef<LocalGameEngine | null>(null);

const handleModeSelected = (mode, botCount, difficulty) => {
  if (mode === 'offline') {
    setIsOffline(true);
    const bots = createBotPlayers(botCount, 1, difficulty);
    const engine = new LocalGameEngine('your-game', [humanPlayer, ...bots], {
      onStateUpdate: updateGameState,
    });
    engineRef.current = engine;
    engine.startGame();
  }
};

const handleAction = (action, amount) => {
  if (isOffline) {
    engineRef.current?.handlePlayerAction(userId, action, amount);
  } else {
    socket.emit('playerAction', { action, amount });
  }
};

return <GameModeSetup onModeSelected={handleModeSelected} />;
```

### Task 2: Create Custom Bot Strategy

```typescript
// src/lib/customGame/botLogic.ts
import { BotDifficulty, GameContext } from '@/lib/teenpatti/botLogic';

export function getCustomBotDecision(
  difficulty: BotDifficulty,
  gameState: any,
): { action: string; amount: number } {
  // Your custom logic here
  if (difficulty === 'hard') {
    // Smart decision
  } else {
    // Simple decision
  }
}
```

### Task 3: Add Bot Thinking Indicator

```typescript
const [thinkingBots, setThinkingBots] = useState<Set<string>>();

const engine = new LocalGameEngine('teen-patti', players, {
  onBotAction: (playerId) => {
    setThinkingBots(prev => {
      const next = new Set(prev);
      next.delete(playerId);  // Bot done thinking
      return next;
    });
  },
});

// When bot turn starts
setThinkingBots(prev => new Set(prev).add(botId));
```

---

## Troubleshooting

### Bots not taking turns
- Check `LocalGameEngine` is initialized ✓
- Verify `startGame()` was called ✓
- Check bots have `isBot: true` flag ✓

### Hand evaluation seems wrong
- Verify card format: `{ rank: string, suit: string }` ✓
- Check hand has exactly 3 cards ✓
- Test with `evaluateHand()` directly ✓

### UI not updating
- Check `onStateUpdate` callback is set ✓
- Verify `setGameState()` is called ✓
- Make sure game state is properly typed ✓

### Bot takes no time to decide
- Should see `getBotThinkDelay()` delay ✓
- Check if running in test mode (mocks?) ✓
- Verify `setInterval`/`setTimeout` not mocked ✓

---

## Performance Tips

1. **Reuse game engine** - Don't recreate for each turn
2. **Batch state updates** - Update multiple players at once
3. **Lazy load components** - Use React.lazy for bot indicator
4. **Optimize hand evaluation** - Already O(1)
5. **Monitor bot think time** - Should be 300-2000ms only

---

## Next Steps

1. ✅ Implement offline mode in your game
2. ✅ Add bot indicators to UI
3. ✅ Test with different difficulties
4. ✅ Gather feedback and adjust
5. 🔄 Consider advanced features (persistence, stats, etc.)

---

For detailed architecture, see: [OFFLINE_BOT_ARCHITECTURE.md](./OFFLINE_BOT_ARCHITECTURE.md)
