import { useState } from "react";

/* ================= CHESS CONSTANTS ================= */

export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
export type Color = "white" | "black";

export interface ChessPiece {
  type: PieceType;
  color: Color;
  hasMoved?: boolean;
}

export interface ChessSquare {
  piece: ChessPiece | null;
  row: number;
  col: number;
}

export interface ChessMove {
  from: { row: number; col: number };
  to: { row: number; col: number };
  promotion?: PieceType;
}

export interface ChessGame {
  board: (ChessPiece | null)[][];
  currentTurn: Color;
  selectedSquare: { row: number; col: number } | null;
  validMoves: { row: number; col: number }[];
  gameStatus: "playing" | "check" | "checkmate" | "stalemate" | "draw";
  moveHistory: ChessMove[];
  capturedPieces: { white: ChessPiece[]; black: ChessPiece[] };
  difficulty: "easy" | "medium" | "hard";
}

/* ================= BOARD INITIALIZATION ================= */

export function initializeBoard(): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Back row setup
  const backRow = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"] as const;
  
  backRow.forEach((type, i) => {
    board[7][i] = { type: type as PieceType, color: "white", hasMoved: false };
    board[0][i] = { type: type as PieceType, color: "black", hasMoved: false };
  });

  // Pawns
  for (let i = 0; i < 8; i++) {
    board[6][i] = { type: "pawn", color: "white", hasMoved: false };
    board[1][i] = { type: "pawn", color: "black", hasMoved: false };
  }

  return board;
}

/* ================= MOVE GENERATION ================= */

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isOpponentPiece(board: (ChessPiece | null)[][], row: number, col: number, color: Color): boolean {
  const piece = board[row][col];
  return piece !== null && piece.color !== color;
}

function getMovesInDirection(
  board: (ChessPiece | null)[][],
  row: number,
  col: number,
  directions: [number, number][],
  maxDistance: number,
  color: Color
): [number, number][] {
  const moves: [number, number][] = [];

  for (const [dr, dc] of directions) {
    for (let i = 1; i <= maxDistance; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;

      if (!isInBounds(newRow, newCol)) break;

      const targetPiece = board[newRow][newCol];

      if (targetPiece === null) {
        moves.push([newRow, newCol]);
      } else if (isOpponentPiece(board, newRow, newCol, color)) {
        moves.push([newRow, newCol]);
        break;
      } else {
        break;
      }
    }
  }

  return moves;
}

function getPawnMoves(
  board: (ChessPiece | null)[][],
  row: number,
  col: number,
  color: Color
): [number, number][] {
  const moves: [number, number][] = [];
  const direction = color === "white" ? -1 : 1;
  const startRow = color === "white" ? 6 : 1;

  // Forward move
  const forwardRow = row + direction;
  if (isInBounds(forwardRow, col) && board[forwardRow][col] === null) {
    moves.push([forwardRow, col]);

    // Double move from starting position
    const doubleRow = row + direction * 2;
    if (row === startRow && board[doubleRow][col] === null) {
      moves.push([doubleRow, col]);
    }
  }

  // Captures
  const captureOffsets = [-1, 1];
  for (const offset of captureOffsets) {
    const captureCol = col + offset;
    if (isInBounds(forwardRow, captureCol) && isOpponentPiece(board, forwardRow, captureCol, color)) {
      moves.push([forwardRow, captureCol]);
    }
  }

  return moves;
}

function getKnightMoves(
  board: (ChessPiece | null)[][],
  row: number,
  col: number,
  color: Color
): [number, number][] {
  const moves: [number, number][] = [];
  const offsets = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  for (const [dr, dc] of offsets) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (isInBounds(newRow, newCol)) {
      const targetPiece = board[newRow][newCol];
      if (targetPiece === null || isOpponentPiece(board, newRow, newCol, color)) {
        moves.push([newRow, newCol]);
      }
    }
  }

  return moves;
}

function getKingMoves(
  board: (ChessPiece | null)[][],
  row: number,
  col: number,
  color: Color
): [number, number][] {
  const moves: [number, number][] = [];
  const offsets = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dr, dc] of offsets) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (isInBounds(newRow, newCol)) {
      const targetPiece = board[newRow][newCol];
      if (targetPiece === null || isOpponentPiece(board, newRow, newCol, color)) {
        moves.push([newRow, newCol]);
      }
    }
  }

  return moves;
}

export function getLegalMoves(
  board: (ChessPiece | null)[][],
  row: number,
  col: number,
  color: Color
): [number, number][] {
  const piece = board[row][col];
  if (!piece || piece.color !== color) return [];

  let moves: [number, number][] = [];

  switch (piece.type) {
    case "pawn":
      moves = getPawnMoves(board, row, col, color);
      break;
    case "rook":
      moves = getMovesInDirection(board, row, col, [[0, 1], [0, -1], [1, 0], [-1, 0]], 8, color);
      break;
    case "knight":
      moves = getKnightMoves(board, row, col, color);
      break;
    case "bishop":
      moves = getMovesInDirection(board, row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]], 8, color);
      break;
    case "queen":
      moves = getMovesInDirection(
        board,
        row,
        col,
        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        8,
        color
      );
      break;
    case "king":
      moves = getKingMoves(board, row, col, color);
      break;
  }

  return moves;
}

/* ================= MOVE EXECUTION ================= */

export function makeMove(
  board: (ChessPiece | null)[][],
  from: { row: number; col: number },
  to: { row: number; col: number },
  promotion?: PieceType
): { board: (ChessPiece | null)[][]; captured: ChessPiece | null } {
  const newBoard = board.map((row) => [...row]);
  const piece = newBoard[from.row][from.col];
  const captured = newBoard[to.row][to.col];

  if (!piece) throw new Error("No piece at source square");

  newBoard[to.row][to.col] = {
    ...piece,
    hasMoved: true,
  };

  if (piece.type === "pawn" && (to.row === 0 || to.row === 7) && promotion) {
    newBoard[to.row][to.col]!.type = promotion;
  }

  newBoard[from.row][from.col] = null;

  return { board: newBoard, captured: captured || null };
}

/* ================= GAME STATUS ================= */

function hasLegalMoves(board: (ChessPiece | null)[][], color: Color): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.color === color && getLegalMoves(board, row, col, color).length > 0) {
        return true;
      }
    }
  }
  return false;
}

function findKing(board: (ChessPiece | null)[][], color: Color): { row: number; col: number } | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.type === "king" && board[row][col]?.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

function isKingInCheck(board: (ChessPiece | null)[][], color: Color): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor = color === "white" ? "black" : "white";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.color === opponentColor) {
        const moves = getLegalMoves(board, row, col, opponentColor);
        if (moves.some((move) => move[0] === kingPos.row && move[1] === kingPos.col)) {
          return true;
        }
      }
    }
  }

  return false;
}

export function getGameStatus(
  board: (ChessPiece | null)[][],
  color: Color
): "playing" | "check" | "checkmate" | "stalemate" {
  const inCheck = isKingInCheck(board, color);
  const hasLegal = hasLegalMoves(board, color);

  if (!hasLegal) {
    return inCheck ? "checkmate" : "stalemate";
  }

  return inCheck ? "check" : "playing";
}

/* ================= BOT AI ================= */

interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
  score: number;
}

function evaluatePiece(piece: ChessPiece): number {
  const values = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0,
  };
  return values[piece.type];
}

function scoreMove(
  board: (ChessPiece | null)[][],
  from: { row: number; col: number },
  to: { row: number; col: number }
): number {
  let score = 0;

  // Capture value
  if (board[to.row][to.col]) {
    score += evaluatePiece(board[to.row][to.col]!) * 10;
  }

  // Center control
  const centerDistance = Math.abs(to.row - 3.5) + Math.abs(to.col - 3.5);
  score += (7 - centerDistance) * 0.5;

  // Piece development (move non-pawns early)
  const piece = board[from.row][from.col];
  if (piece?.type !== "pawn" && piece?.type !== "king" && !piece?.hasMoved) {
    score += 1;
  }

  return score;
}

export function getBotMove(
  board: (ChessPiece | null)[][],
  difficulty: "easy" | "medium" | "hard"
): ChessMove | null {
  const moves: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === "black") {
        const legalMoves = getLegalMoves(board, row, col, "black");

        for (const [toRow, toCol] of legalMoves) {
          const score = scoreMove(board, { row, col }, { row: toRow, col: toCol });
          moves.push({
            from: { row, col },
            to: { row: toRow, col: toCol },
            score,
          });
        }
      }
    }
  }

  if (moves.length === 0) return null;

  let selectedMove: Move;

  switch (difficulty) {
    case "easy":
      // Random move
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
      break;
    case "medium":
      // Mix of random and best
      const topMoves = moves.sort((a, b) => b.score - a.score).slice(0, 5);
      selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
      break;
    case "hard":
      // Best move
      selectedMove = moves.sort((a, b) => b.score - a.score)[0];
      break;
  }

  return {
    from: selectedMove.from,
    to: selectedMove.to,
  };
}

/* ================= GAME HOOK ================= */

export function useChessGame(difficulty: "easy" | "medium" | "hard" = "medium") {
  const [game, setGame] = useState<ChessGame>({
    board: initializeBoard(),
    currentTurn: "white",
    selectedSquare: null,
    validMoves: [],
    gameStatus: "playing",
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    difficulty,
  });

  const selectSquare = (row: number, col: number) => {
    if (game.gameStatus !== "playing") return;

    // If clicking same square, deselect
    if (game.selectedSquare?.row === row && game.selectedSquare?.col === col) {
      setGame({ ...game, selectedSquare: null, validMoves: [] });
      return;
    }

    // If move destination
    if (game.validMoves.some((m) => m.row === row && m.col === col)) {
      const { board: newBoard, captured } = makeMove(game.board, game.selectedSquare!, { row, col });
      const newStatus = getGameStatus(newBoard, "black");

      setGame({
        ...game,
        board: newBoard,
        currentTurn: "black",
        selectedSquare: null,
        validMoves: [],
        gameStatus: newStatus,
        moveHistory: [...game.moveHistory, { from: game.selectedSquare!, to: { row, col } }],
        capturedPieces: {
          ...game.capturedPieces,
          white: captured ? [...game.capturedPieces.white, captured] : game.capturedPieces.white,
        },
      });

      return;
    }

    // Select new square
    const piece = game.board[row][col];
    if (piece?.color === "white") {
      const validMoves = getLegalMoves(game.board, row, col, "white");
      setGame({
        ...game,
        selectedSquare: { row, col },
        validMoves,
      });
    }
  };

  const makeBotMove = () => {
    setTimeout(() => {
      const botMove = getBotMove(game.board, game.difficulty);
      if (botMove) {
        const { board: newBoard, captured } = makeMove(game.board, botMove.from, botMove.to);
        const newStatus = getGameStatus(newBoard, "white");

        setGame({
          ...game,
          board: newBoard,
          currentTurn: "white",
          selectedSquare: null,
          validMoves: [],
          gameStatus: newStatus,
          moveHistory: [...game.moveHistory, botMove],
          capturedPieces: {
            ...game.capturedPieces,
            black: captured ? [...game.capturedPieces.black, captured] : game.capturedPieces.black,
          },
        });
      }
    }, 800 + Math.random() * 400);
  };

  const resetGame = () => {
    setGame({
      board: initializeBoard(),
      currentTurn: "white",
      selectedSquare: null,
      validMoves: [],
      gameStatus: "playing",
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      difficulty,
    });
  };

  return { game, selectSquare, makeBotMove, resetGame };
}
