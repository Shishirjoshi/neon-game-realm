import React from "react";
import { motion } from "framer-motion";
import { ChessPiece, Color, PieceType } from "@/game/offlineChess";

interface ChessBoardProps {
  board: (ChessPiece | null)[][];
  selectedSquare: { row: number; col: number } | null;
  validMoves: { row: number; col: number }[];
  onSquareClick: (row: number, col: number) => void;
  currentTurn: Color;
}

const PIECE_SYMBOLS: Record<PieceType, Record<Color, string>> = {
  pawn: { white: "♙", black: "♟" },
  rook: { white: "♖", black: "♜" },
  knight: { white: "♘", black: "♞" },
  bishop: { white: "♗", black: "♝" },
  queen: { white: "♕", black: "♛" },
  king: { white: "♔", black: "♚" },
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  validMoves,
  onSquareClick,
  currentTurn,
}) => {
  const isLight = (row: number, col: number) => (row + col) % 2 === 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Turn indicator */}
      <div className="text-center mb-4 text-sm font-semibold">
        <span
          className={`px-4 py-2 rounded-lg ${
            currentTurn === "white"
              ? "bg-white text-black"
              : "bg-gray-900 text-white border border-cyan-400"
          }`}
        >
          {currentTurn === "white" ? "Your Turn (White)" : "Bot's Turn (Black)"}
        </span>
      </div>

      {/* Chess Board */}
      <div className="border-4 border-cyan-500 shadow-2xl shadow-cyan-500/50 rounded-lg overflow-hidden bg-black">
        <div className="grid grid-cols-8 gap-0">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isSelected =
                selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
              const isValidMove = validMoves.some(
                (m) => m.row === rowIndex && m.col === colIndex
              );
              const isLight = (rowIndex + colIndex) % 2 === 0;

              return (
                <motion.button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => onSquareClick(rowIndex, colIndex)}
                  className={`
                    w-16 h-16 flex items-center justify-center text-5xl font-bold
                    relative transition-all duration-200 cursor-pointer
                    ${isLight ? "bg-gray-200" : "bg-gray-800"}
                    ${isSelected ? "ring-4 ring-yellow-400" : ""}
                    ${isValidMove ? "ring-4 ring-cyan-400" : ""}
                    hover:opacity-80
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Valid move indicator */}
                  {isValidMove && !piece && (
                    <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                  )}

                  {/* Capture indicator */}
                  {isValidMove && piece && (
                    <div className="absolute inset-0 border-4 border-red-500 rounded-sm" />
                  )}

                  {/* Piece */}
                  {piece && (
                    <motion.span
                      className={`select-none drop-shadow-lg ${
                        piece.color === "white" ? "text-white" : "text-yellow-300"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {PIECE_SYMBOLS[piece.type][piece.color]}
                    </motion.span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* Coordinates */}
      <div className="mt-2 text-xs text-gray-500 flex justify-between px-1">
        <span>a</span>
        <span>b</span>
        <span>c</span>
        <span>d</span>
        <span>e</span>
        <span>f</span>
        <span>g</span>
        <span>h</span>
      </div>
    </div>
  );
};
