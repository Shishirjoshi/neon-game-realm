import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Home } from "lucide-react";
import { useChessGame, getGameStatus } from "@/game/offlineChess";
import { ChessBoard } from "@/components/ChessBoard";

/**
 * GLASS CHESS OFFLINE - PLAY AGAINST BOT
 * Fully offline chess game with AI opponent
 */

interface ChessOfflineProps {
  onExit?: () => void;
}

const ChessOffline: React.FC<ChessOfflineProps> = ({ onExit = () => {} }) => {
  const [difficulty, setDifficulty] = React.useState<"easy" | "medium" | "hard">("medium");
  const [showSetup, setShowSetup] = React.useState(true);
  const { game, selectSquare, makeBotMove, resetGame } = useChessGame(difficulty);

  // Auto-make bot move when it's black's turn
  useEffect(() => {
    if (game.currentTurn === "black" && game.gameStatus === "playing") {
      makeBotMove();
    }
  }, [game.currentTurn, game.gameStatus]);

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-black/80 backdrop-blur border border-cyan-500 rounded-2xl p-8 shadow-2xl shadow-cyan-500/30">
            <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Glass Chess
            </h1>
            <p className="text-center text-gray-400 mb-8">
              Challenge the AI in classic chess
            </p>

            {/* Difficulty Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-cyan-300">
                Select Difficulty
              </label>

              <div className="space-y-3">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      difficulty === level
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">
                      {level === "easy" && "🟢 Easy - Beginner AI"}
                      {level === "medium" && "🟡 Medium - Intermediate AI"}
                      {level === "hard" && "🔴 Hard - Advanced AI"}
                    </span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => setShowSetup(false)}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Game
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const statusMessages = {
    playing: "Make your move",
    check: "Your king is in check!",
    checkmate: "Checkmate! You lost!",
    stalemate: "Stalemate - Draw!",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Glass Chess
            </h1>
            <p className="text-cyan-300 text-sm mt-1">
              Difficulty: {difficulty.toUpperCase()}
            </p>
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={() => resetGame()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={18} /> New Game
            </motion.button>

            <motion.button
              onClick={onExit}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home size={18} /> Exit
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chess Board */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2"
          >
            <ChessBoard
              board={game.board}
              selectedSquare={game.selectedSquare}
              validMoves={game.validMoves}
              onSquareClick={selectSquare}
              currentTurn={game.currentTurn}
            />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Status */}
            <div className="bg-black/60 backdrop-blur border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-cyan-300 font-bold mb-4">Game Status</h3>
              <div
                className={`p-4 rounded-lg text-center font-semibold ${
                  game.gameStatus === "playing"
                    ? "bg-blue-900/50 border border-blue-400 text-blue-300"
                    : game.gameStatus === "check"
                    ? "bg-yellow-900/50 border border-yellow-400 text-yellow-300"
                    : "bg-red-900/50 border border-red-400 text-red-300"
                }`}
              >
                {statusMessages[game.gameStatus]}
              </div>
            </div>

            {/* Captured Pieces */}
            <div className="bg-black/60 backdrop-blur border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-cyan-300 font-bold mb-4">Captured Pieces</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Your Captures:</p>
                <div className="bg-gray-800/50 rounded p-3 text-2xl h-16 flex flex-wrap items-center gap-1 overflow-y-auto">
                  {game.capturedPieces.white.map((piece, i) => (
                    <span key={i} className="text-yellow-300">
                      {piece.type === "pawn"
                        ? "♟"
                        : piece.type === "rook"
                        ? "♜"
                        : piece.type === "knight"
                        ? "♞"
                        : piece.type === "bishop"
                        ? "♝"
                        : piece.type === "queen"
                        ? "♛"
                        : "♚"}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Bot's Captures:</p>
                <div className="bg-gray-800/50 rounded p-3 text-2xl h-16 flex flex-wrap items-center gap-1 overflow-y-auto">
                  {game.capturedPieces.black.map((piece, i) => (
                    <span key={i} className="text-white">
                      {piece.type === "pawn"
                        ? "♙"
                        : piece.type === "rook"
                        ? "♖"
                        : piece.type === "knight"
                        ? "♘"
                        : piece.type === "bishop"
                        ? "♗"
                        : piece.type === "queen"
                        ? "♕"
                        : "♔"}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-black/60 backdrop-blur border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-cyan-300 font-bold mb-4">Moves ({game.moveHistory.length})</h3>
              <div className="bg-gray-800/50 rounded p-3 h-48 overflow-y-auto space-y-2">
                {game.moveHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No moves yet</p>
                ) : (
                  game.moveHistory.map((move, i) => (
                    <p key={i} className="text-sm text-gray-300">
                      {Math.floor(i / 2) + 1}.{" "}
                      {String.fromCharCode(97 + move.from.col)}
                      {8 - move.from.row} →{" "}
                      {String.fromCharCode(97 + move.to.col)}
                      {8 - move.to.row}
                      {i % 2 === 1 && " "}
                    </p>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChessOffline;
