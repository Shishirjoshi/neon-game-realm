import React, { useState, useEffect } from 'react';
import { Loader, RotateCcw, Home } from 'lucide-react';

/**
 * TEEN PATTI OFFLINE - PLAY AGAINST BOTS
 * Fully offline game mode with AI opponents
 */

const TeenPattiOffline = ({ onExit = () => {} }) => {
  // Game state
  const [gameState, setGameState] = useState('setup'); // setup | playing | finished
  const [difficulty, setDifficulty] = useState('medium'); // easy | medium | hard
  const [playerCount, setPlayerCount] = useState(3);
  const [playerName, setPlayerName] = useState('You');

  // Game data
  const [players, setPlayers] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [pot, setPot] = useState(0);
  const [gameRound, setGameRound] = useState(1);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Deck and hands
  const [deck, setDeck] = useState([]);

  /**
   * CREATE DECK
   */
  const createDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const newDeck = [];

    for (let suit of suits) {
      for (let rank of ranks) {
        newDeck.push({ rank, suit });
      }
    }

    return newDeck;
  };

  /**
   * SHUFFLE DECK (Fisher-Yates)
   */
  const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /**
   * DEAL CARDS
   */
  const dealCards = (playerList, newDeck) => {
    let cardIndex = 0;
    return playerList.map((player) => ({
      ...player,
      hand: [newDeck[cardIndex++], newDeck[cardIndex++], newDeck[cardIndex++]],
      folded: false,
      currentBet: 0,
    }));
  };

  /**
   * EVALUATE HAND
   */
  const evaluateHand = (hand) => {
    if (!hand || hand.length !== 3) {
      return { type: 'invalid', rank: 0 };
    }

    const rankValues = {
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      'J': 11,
      'Q': 12,
      'K': 13,
      'A': 14,
    };

    const ranks = hand.map((card) => rankValues[card.rank]).sort((a, b) => b - a);
    const suits = hand.map((card) => card.suit);
    const rankCounts = {};

    ranks.forEach((r) => {
      rankCounts[r] = (rankCounts[r] || 0) + 1;
    });

    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    // Trio
    if (counts[0] === 3) {
      return { type: 'trio', rank: 5, highCard: ranks[0] };
    }

    // Sequence
    const isSequence = ranks[0] - ranks[1] === 1 && ranks[1] - ranks[2] === 1;
    const isWheelSequence = ranks[0] === 14 && ranks[1] === 3 && ranks[2] === 2;

    if (isSequence || isWheelSequence) {
      return { type: 'sequence', rank: 4, highCard: isWheelSequence ? 5 : ranks[0] };
    }

    // Color
    if (suits[0] === suits[1] && suits[1] === suits[2]) {
      return { type: 'color', rank: 3, highCard: ranks[0] };
    }

    // Pair
    if (counts[0] === 2) {
      return { type: 'pair', rank: 2, highCard: Object.keys(rankCounts).find((k) => rankCounts[k] === 2) };
    }

    // High card
    return { type: 'highcard', rank: 1, highCard: ranks[0] };
  };

  /**
   * COMPARE HANDS
   */
  const compareHands = (hand1, hand2) => {
    const eval1 = evaluateHand(hand1);
    const eval2 = evaluateHand(hand2);

    if (eval1.rank > eval2.rank) return 1;
    if (eval1.rank < eval2.rank) return -1;

    if (eval1.highCard > eval2.highCard) return 1;
    if (eval1.highCard < eval2.highCard) return -1;

    return 0;
  };

  /**
   * DETERMINE WINNER
   */
  const determineWinner = (playerList) => {
    const activePlayers = playerList.filter((p) => !p.folded);

    if (activePlayers.length === 0) return null;
    if (activePlayers.length === 1) return activePlayers[0];

    let winner = activePlayers[0];
    for (let i = 1; i < activePlayers.length; i++) {
      if (compareHands(winner.hand, activePlayers[i].hand) < 0) {
        winner = activePlayers[i];
      }
    }

    return winner;
  };

  /**
   * GET BOT DECISION
   */
  const getBotDecision = (bot, currentPot, activePlayers) => {
    const handStrength = evaluateHand(bot.hand).rank / 5; // 0 to 1

    let foldThreshold;

    if (difficulty === 'easy') {
      foldThreshold = Math.random() > 0.5 ? 0.3 : 0.5;
    } else if (difficulty === 'medium') {
      foldThreshold = 0.35;
    } else {
      foldThreshold = 0.2;
    }

    if (handStrength < foldThreshold && Math.random() > 0.3) {
      return 'fold';
    }

    return 'bet';
  };

  /**
   * START GAME
   */
  const startGame = () => {
    // Create players
    const newPlayers = [{ id: 'player', name: playerName, coins: 1000, isBot: false }];

    for (let i = 0; i < playerCount - 1; i++) {
      const botNames = ['Alex', 'Maya', 'Ravi', 'Priya', 'Dev'];
      newPlayers.push({
        id: `bot-${i}`,
        name: botNames[i % botNames.length],
        coins: 1000,
        isBot: true,
      });
    }

    // Create deck and deal cards
    let newDeck = shuffleDeck(createDeck());
    const dealtPlayers = dealCards(newPlayers, newDeck);

    setPlayers(dealtPlayers);
    setCurrentTurnIndex(0);
    setPot(0);
    setGameState('playing');
    setMessage('Game started! Your turn to act.');
    setDeck(newDeck);
  };

  /**
   * NEXT TURN
   */
  const nextTurn = (currentPlayers) => {
    let nextIndex = (currentTurnIndex + 1) % currentPlayers.length;
    let attempts = 0;

    while (attempts < currentPlayers.length) {
      if (!currentPlayers[nextIndex].folded) {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % currentPlayers.length;
      attempts++;
    }

    return -1; // No active players
  };

  /**
   * PLAYER BET
   */
  const playerBet = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const updatedPlayers = [...players];
      const currentPlayer = updatedPlayers[currentTurnIndex];

      if (currentPlayer.coins < 10) {
        setMessage('Insufficient coins!');
        setIsProcessing(false);
        return;
      }

      currentPlayer.coins -= 10;
      currentPlayer.currentBet += 10;
      setPot((prev) => prev + 10);

      const nextIdx = nextTurn(updatedPlayers);

      if (nextIdx === -1) {
        endGame(updatedPlayers);
      } else {
        setCurrentTurnIndex(nextIdx);
        setPlayers(updatedPlayers);

        if (updatedPlayers[nextIdx].isBot) {
          processBotAction(updatedPlayers, nextIdx);
        } else {
          setMessage('Your turn!');
        }
      }

      setIsProcessing(false);
    }, 800);
  };

  /**
   * PLAYER FOLD
   */
  const playerFold = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const updatedPlayers = [...players];
      updatedPlayers[currentTurnIndex].folded = true;

      const activePlayers = updatedPlayers.filter((p) => !p.folded);

      if (activePlayers.length === 1) {
        endGame(updatedPlayers);
      } else {
        const nextIdx = nextTurn(updatedPlayers);

        if (nextIdx === -1) {
          endGame(updatedPlayers);
        } else {
          setCurrentTurnIndex(nextIdx);
          setPlayers(updatedPlayers);

          if (updatedPlayers[nextIdx].isBot) {
            processBotAction(updatedPlayers, nextIdx);
          } else {
            setMessage('Your turn!');
          }
        }
      }

      setIsProcessing(false);
    }, 800);
  };

  /**
   * PROCESS BOT ACTION
   */
  const processBotAction = (currentPlayers, botIndex) => {
    const bot = currentPlayers[botIndex];
    const activePlayers = currentPlayers.filter((p) => !p.folded);

    const decision = getBotDecision(bot, pot, activePlayers);

    setTimeout(() => {
      const updatedPlayers = [...currentPlayers];

      if (decision === 'fold') {
        updatedPlayers[botIndex].folded = true;
        setMessage(`${bot.name} folded!`);

        const stillActive = updatedPlayers.filter((p) => !p.folded);
        if (stillActive.length === 1) {
          endGame(updatedPlayers);
          return;
        }
      } else {
        if (updatedPlayers[botIndex].coins < 10) {
          updatedPlayers[botIndex].coins = 0;
          updatedPlayers[botIndex].currentBet += updatedPlayers[botIndex].coins;
          setPot((prev) => prev + updatedPlayers[botIndex].coins);
        } else {
          updatedPlayers[botIndex].coins -= 10;
          updatedPlayers[botIndex].currentBet += 10;
          setPot((prev) => prev + 10);
        }

        setMessage(`${bot.name} bet ₨10`);
      }

      const nextIdx = nextTurn(updatedPlayers);

      if (nextIdx === -1) {
        endGame(updatedPlayers);
      } else {
        setCurrentTurnIndex(nextIdx);
        setPlayers(updatedPlayers);

        if (updatedPlayers[nextIdx].isBot) {
          setTimeout(() => processBotAction(updatedPlayers, nextIdx), 1500);
        } else {
          setMessage('Your turn!');
        }
      }
    }, 1500);
  };

  /**
   * END GAME
   */
  const endGame = (finalPlayers) => {
    const gameWinner = determineWinner(finalPlayers);

    if (gameWinner) {
      gameWinner.coins += pot;
      setWinner(gameWinner);
      setMessage(`🎉 ${gameWinner.name} won ₨${pot}!`);
    }

    setPlayers(finalPlayers);
    setGameState('finished');
  };

  /**
   * NEW GAME
   */
  const newGame = () => {
    setGameRound((prev) => prev + 1);
    setPot(0);
    setWinner(null);
    startGame();
  };

  /**
   * SETUP SCREEN
   */
  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Teen Patti Offline</h1>

          <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 space-y-6">
            {/* Player Name */}
            <div>
              <label className="text-white font-semibold mb-2 block">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Player Count */}
            <div>
              <label className="text-white font-semibold mb-2 block">Number of Bots</label>
              <select
                value={playerCount - 1}
                onChange={(e) => setPlayerCount(parseInt(e.target.value) + 1)}
                className="w-full px-4 py-2 bg-white/20 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="1">1 Bot (2 total)</option>
                <option value="2">2 Bots (3 total)</option>
                <option value="3">3 Bots (4 total)</option>
                <option value="4">4 Bots (5 total)</option>
                <option value="5">5 Bots (6 total)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-white font-semibold mb-2 block">Difficulty</label>
              <div className="space-y-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <label key={level} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value={level}
                      checked={difficulty === level}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-white capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              Start Game
            </button>

            {/* Exit Button */}
            <button
              onClick={onExit}
              className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <Home size={18} /> Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * PLAYING SCREEN
   */
  if (gameState === 'playing') {
    const currentPlayer = players[currentTurnIndex];
    const myPlayer = players.find((p) => p.id === 'player');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
            Teen Patti Offline - Round {gameRound}
          </h1>

          {/* Status Bar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">POT</p>
              <p className="text-2xl font-bold text-cyan-400">₨{pot}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">CURRENT TURN</p>
              <p className="text-2xl font-bold text-purple-400">{currentPlayer?.name}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">YOUR BALANCE</p>
              <p className="text-2xl font-bold text-green-400">₨{myPlayer?.coins}</p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-cyan-500/20 border border-cyan-400/50 rounded-xl p-4 text-center text-cyan-300 font-semibold mb-8">
            {message}
          </div>

          {/* Players Table */}
          <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Players</h2>
            <div className="space-y-3">
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg flex justify-between items-center ${
                    idx === currentTurnIndex ? 'bg-cyan-500/30 border-l-4 border-cyan-400' : 'bg-white/5'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-white font-bold">
                      {player.name}
                      {!player.isBot && ' (You)'}
                      {player.isBot && ' (Bot)'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Balance: ₨{player.coins} | Bet: ₨{player.currentBet}
                    </p>
                  </div>

                  <div className="text-right">
                    {player.folded && <p className="text-red-400 font-bold">FOLDED</p>}
                    {idx === currentTurnIndex && !player.folded && (
                      <div className="flex items-center gap-2">
                        {isProcessing ? (
                          <Loader className="w-5 h-5 text-cyan-400 animate-spin" />
                        ) : (
                          <p className="text-cyan-400 font-bold">🎯 TURN</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {currentPlayer?.id === 'player' && !currentPlayer.folded && (
            <div className="flex gap-4">
              <button
                onClick={playerBet}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? 'Processing...' : 'Bet ₨10'}
              </button>

              <button
                onClick={playerFold}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? 'Processing...' : 'Fold'}
              </button>
            </div>
          )}

          {currentPlayer?.id !== 'player' && !currentPlayer?.folded && (
            <div className="text-center text-gray-400 py-4 flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Waiting for {currentPlayer?.name}...
            </div>
          )}
        </div>
      </div>
    );
  }

  /**
   * FINISHED SCREEN
   */
  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Round Finished! 🎉</h1>

          {/* Winner Card */}
          {winner && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-8 mb-8 text-center">
              <p className="text-slate-900 font-bold text-lg mb-2">WINNER</p>
              <p className="text-slate-900 font-bold text-3xl mb-2">{winner.name}</p>
              <p className="text-slate-900 font-bold text-2xl">Won ₨{pot}</p>
            </div>
          )}

          {/* Final Results */}
          <div className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Final Results</h2>
            <div className="space-y-2">
              {players.map((player) => (
                <div key={player.id} className="bg-white/5 p-4 rounded-lg">
                  <p className="text-white font-bold">{player.name}</p>
                  <p className="text-gray-400 text-sm">Balance: ₨{player.coins}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={newGame}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> New Round
            </button>

            <button
              onClick={() => setGameState('setup')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
            >
              <Home size={20} /> Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TeenPattiOffline;
