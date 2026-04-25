# Teen Patti - Offline Bot Mode Guide

## Overview

The **Offline Bot Mode** allows you to play Teen Patti against AI opponents without requiring an internet connection or server. Perfect for practice, casual gameplay, or playing anytime, anywhere.

---

## Features

✅ **Play Offline** - No internet or server required  
✅ **AI Opponents** - 1-5 intelligent bots  
✅ **3 Difficulty Levels** - Easy, Medium, Hard  
✅ **Multiple Personalities** - Aggressive, Cautious, Balanced  
✅ **Full Hand Ranking** - Trio, Sequence, Color, Pair, High Card  
✅ **Smooth Animations** - Realistic game flow  
✅ **Instant Play** - No waiting for other players  

---

## How It Works

### 1. Game Setup
- Enter your player name
- Select number of AI bots (1-5)
- Choose difficulty level
- Press "Start Game"

### 2. Game Flow
- Server shuffles deck and deals 3 cards to each player
- Players take turns (clockwise)
- Each turn: **BET** (₨10) or **FOLD**
- Game ends when only 1 player remains or all players have acted
- Winner gets entire pot

### 3. Bot Decision Making

#### Easy Difficulty
- **Behavior:** Folds frequently, random betting
- **Folding Threshold:** 40-60% (depends on personality)
- **Best for:** Beginners practicing
- **Win Rate:** Lowest

#### Medium Difficulty
- **Behavior:** Balanced play, some bluffing
- **Folding Threshold:** 35%
- **Best for:** Casual players
- **Win Rate:** Medium

#### Hard Difficulty
- **Behavior:** Aggressive, analyzes pot odds, strategic bluffing
- **Folding Threshold:** 20% (aggressive) or 40% (cautious)
- **Best for:** Experienced players
- **Win Rate:** Highest

### 4. Bot Personalities

Each bot has one of three personalities that affects their play style:

- **Aggressive** - Bets often, risks coins, plays many hands
- **Cautious** - Folds easily, plays only strong hands
- **Balanced** - Mix of both approaches

---

## File Structure

```
backend/
└── botService.js          # AI logic and bot manager

src/
└── pages/
    ├── TeenPattiOffline.tsx    # Offline game component
    ├── TeenPattiHub.tsx        # Game mode selector
    └── TeenPattiMVP.tsx        # Online multiplayer
```

---

## Bot AI Algorithm

### Hand Strength Evaluation (0 to 1)

```javascript
Trio       → 1.0  (strongest)
Sequence   → 0.9
Color      → 0.8
Pair       → 0.6
High Card  → 0.3  (weakest)
```

Bonus: +0.15 if high card is J, Q, K, or A

### Decision Logic

```
IF hand_strength < folding_threshold
  → Consider folding (with some bluff probability)
ELSE
  → Bet

HARD MODE ONLY:
  - Check pot odds
  - Analyze player count
  - Semi-bluff with decent hands
```

### Thinking Time

Bots have realistic thinking delays:
- **Easy:** 500-1500ms
- **Medium/Hard:** 500-2500ms

---

## Game Rules (Offline)

1. **Starting Balance:** ₨1000 per player
2. **Fixed Bet:** ₨10 per turn
3. **Win Condition:** Only 1 player remains OR all have acted once
4. **Prize:** Winner takes entire pot
5. **Hand Ranking:** Trio > Sequence > Color > Pair > High Card

---

## Usage Example (React)

```jsx
import TeenPattiOffline from '@/pages/TeenPattiOffline';

export default function Game() {
  return (
    <TeenPattiOffline onExit={() => {
      // Handle exit
    }} />
  );
}
```

Or use the Hub to switch between modes:

```jsx
import TeenPattiHub from '@/pages/TeenPattiHub';
import TeenPattiMVP from '@/pages/TeenPattiMVP';
import TeenPattiOffline from '@/pages/TeenPattiOffline';

export default function App() {
  return (
    <TeenPattiHub
      TeenPattiMVP={TeenPattiMVP}
      TeenPattiOffline={TeenPattiOffline}
    />
  );
}
```

---

## Bot Names

Default bot names include:
- Alex
- Maya
- Ravi
- Priya
- Dev

You can customize bot names in the `TeenPattiOffline.tsx` component.

---

## Customization

### Change Difficulty
Edit `TeenPattiOffline.tsx`:

```jsx
const [difficulty, setDifficulty] = useState('hard'); // Change default
```

### Add More Bots
Edit `botService.js`:

```javascript
const botNames = [
  'Alexa', 'Shadow', 'Phoenix', 'Nova', 'Titan', 'Blaze', 'Storm', 'Phoenix'
];
```

### Adjust Folding Threshold
Edit the `decideAction()` method in `botService.js`:

```javascript
const foldThreshold = 0.4; // Adjust value (0.0 = always bet, 1.0 = always fold)
```

---

## Performance

- **No Server Load** - All game logic runs locally
- **Instant Response** - No network latency
- **Smooth Animations** - 60fps gameplay
- **Low CPU Usage** - Minimal AI calculations

---

## Debugging

### Check Hand Strength
Add console logging to `evaluateHand()`:

```javascript
console.log('Hand evaluation:', evaluateHand(bot.hand));
```

### Monitor Bot Decisions
Enable logging in `getBotDecision()`:

```javascript
console.log(`Bot decision: ${decision}, strength: ${handStrength}`);
```

### Test Different Difficulties
Switch difficulty in UI and observe bot behavior over multiple rounds.

---

## Future Enhancements

- [ ] Bot personality profiles (names linked to styles)
- [ ] Learning bots (AI improves over time)
- [ ] Replay system
- [ ] Statistics tracking
- [ ] Achievements and rewards
- [ ] Hand history analysis
- [ ] Custom bot creation
- [ ] Multiplayer offline (hotseat mode)

---

## Comparison: Online vs Offline

| Feature | Online | Offline |
|---------|--------|---------|
| Multiplayer | ✅ Real players | ✅ AI bots |
| Internet | ✅ Required | ❌ Not needed |
| Setup | Players needed | Instant |
| AI Difficulty | N/A | 3 levels |
| Offline Play | ❌ No | ✅ Yes |
| Real Currency | ✅ Possible | ❌ Virtual |
| Social | ✅ Chat/Friends | ❌ Solo |

---

## Troubleshooting

### Bots folding too much?
- Decrease difficulty to "easy"
- Or change personality to "aggressive"

### Bots playing too aggressively?
- Increase difficulty to "hard"
- Or change personality to "cautious"

### Game crashes?
- Check browser console for errors
- Clear cache and reload
- Verify React version compatibility

---

## API Reference

### Bot Class

```javascript
new Bot(id, name, difficulty, personality)

// Methods
bot.decideAction(pot, stake, activePlayers, allPlayers)
bot.evaluateHandStrength()
bot.calculatePotOdds(pot, toBet)
bot.getBetAmount(minBet)
```

### BotManager Class

```javascript
botManager.createBots(count, difficulty)
botManager.getBot(botId)
botManager.getAllBots()
botManager.resetBots()
```

---

## Tips for Playing

1. **Study Bot Patterns** - Each difficulty plays differently
2. **Bankroll Management** - Manage your ₨1000 carefully
3. **Position Matters** - Acting last gives you info advantage
4. **Bluff Occasionally** - Bots don't track your bluffs
5. **Practice Hard Mode** - Improves skills for online play

---

## License

Part of the Neon Game Realm project.

---

**Version:** 1.0.0  
**Last Updated:** April 25, 2026
