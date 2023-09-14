export type pieceType = 'p' | 'k' | 'q' | 'b' | 'n' | 'r' // black pieces
  | 'P' | 'K' | 'Q' | 'B' | 'N' | 'R'; // white pieces

export type playerType = "w" | "b";

export type boardType = Map<coordinateType, pieceType>;

type rank = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
type file = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
export type coordinateType = `${rank},${file}` | null;

type castlingMoveType = "K" | "Q" | "k" | "q";
type enpassantMoveType = "e";
type moveType = "m" | 'x' | castlingMoveType | enpassantMoveType;
export type validMovesBoardType = Map<coordinateType, moveType>;

type whiteKingSideCastlingFEN = "K" | "";
type whiteQueenSideCastlingFEN = "Q" | "";
type blackKingSideCastlingFEN = "k" | "";
type blackQueenSideCastlingFEN = "q" | "";
export type castlingFEN = 
  `${whiteKingSideCastlingFEN}${whiteQueenSideCastlingFEN}${blackKingSideCastlingFEN}${blackQueenSideCastlingFEN}`;
type boardFile = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
type boardRank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type boardSquare = `${boardFile}${boardRank}`;
export interface fenComponents {
  position: string | null,
  onMove: playerType | null,
  castle: castlingFEN | null,
  enPassantTargetSquare: boardSquare | null,
  halfMoveClock: number | null,
  fullMoveNumber: number | null
}

export interface kingPosition {
  white: coordinateType | null,
  black: coordinateType | null
}

export interface controlledSquares {
  white: validMovesBoardType,
  black: validMovesBoardType
}

export interface lastMove {
  from: coordinateType,
  to: coordinateType
}
