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
