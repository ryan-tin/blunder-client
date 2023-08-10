import { boardType, coordinateType, pieceType, playerType, validMovesBoardType } from "../types/Types";
import { findValidBishopMoves } from "./bishopMoves";
import { findPawnControlledSquares, findValidPawnMoves } from "./pawnMoves";
import { findValidRookMoves } from "./rookMoves";
import { findValidQueenMoves } from "./queenMoves";
import { findValidKnightMoves } from "./knightMoves";
import { findKingControlledSquares, findValidKingMoves } from "./kingMoves";

/**
  * this only works if target.alt exits
  * to find the valid moves in handleClick
  */
export function handleFindValidMoves(
  target: any,
  currentPosition: coordinateType,
  board: boardType,
  controlledSquares: validMovesBoardType,
  FEN: string,
  checkPosition: coordinateType
): validMovesBoardType {
  let validMoves;
  switch (target.alt) {
    case 'White Pawn':
      validMoves = findValidPawnMoves(currentPosition!, board, 'w', FEN);
      break;
    case 'Black Pawn':
      validMoves = findValidPawnMoves(currentPosition!, board, 'b', FEN);
      break;
    case 'White Rook':
      validMoves = findValidRookMoves(currentPosition!, board, 'w');
      break;
    case 'Black Rook':
      validMoves = findValidRookMoves(currentPosition!, board, 'b');
      break;
    case 'White Bishop':
      validMoves = findValidBishopMoves(currentPosition!, board, 'w');
      break;
    case 'Black Bishop':
      validMoves = findValidBishopMoves(currentPosition!, board, 'b');
      break;
    case 'White Queen':
      validMoves = findValidQueenMoves(currentPosition!, board, 'w');
      break;
    case 'Black Queen':
      validMoves = findValidQueenMoves(currentPosition!, board, 'b');
      break;
    case 'White Knight':
      validMoves = findValidKnightMoves(currentPosition!, board, 'w');
      break;
    case 'Black Knight':
      validMoves = findValidKnightMoves(currentPosition!, board, 'b');
      break;
    case 'White King':
      validMoves = findValidKingMoves(currentPosition!, board, controlledSquares, 'w', FEN, checkPosition);
      break;
    case 'Black King':
      validMoves = findValidKingMoves(currentPosition!, board, controlledSquares, 'b', FEN, checkPosition);
      break;
  }

  return validMoves !== undefined ? validMoves : new Map();
}

/** same as handleFindValidMoves() but can be used outside handleClick
  * because target is not taken, rather a pieceType is taken
  */
export function findValidMoves(
  piece: pieceType,
  currentPosition: coordinateType,
  board: boardType,
  controlledSquares: validMovesBoardType,
  FEN: string
) {
  let validMoves;
  switch (piece) {
    case 'P':
      validMoves = findValidPawnMoves(currentPosition!, board, 'w', FEN);
      break;
    case 'p':
      validMoves = findValidPawnMoves(currentPosition!, board, 'b', FEN);
      break;
    case 'R':
      validMoves = findValidRookMoves(currentPosition!, board, 'w');
      break;
    case 'r':
      validMoves = findValidRookMoves(currentPosition!, board, 'b');
      break;
    case 'B':
      validMoves = findValidBishopMoves(currentPosition!, board, 'w');
      break;
    case 'b':
      validMoves = findValidBishopMoves(currentPosition!, board, 'b');
      break;
    case 'Q':
      validMoves = findValidQueenMoves(currentPosition!, board, 'w');
      break;
    case 'q':
      validMoves = findValidQueenMoves(currentPosition!, board, 'b');
      break;
    case 'N':
      validMoves = findValidKnightMoves(currentPosition!, board, 'w');
      break;
    case 'n':
      validMoves = findValidKnightMoves(currentPosition!, board, 'b');
      break;
    case 'K':
      validMoves = findValidKingMoves(currentPosition!, board, controlledSquares, 'w', FEN);
      break;
    case 'k':
      validMoves = findValidKingMoves(currentPosition!, board, controlledSquares, 'b', FEN);
      break;
  }
  return validMoves;
}

/**
  * finds the squares that are controlled by a given piece 
  * @param {pieceType} piece - the piece to find the attacking moves for
  * @param {boardType} boardPosition - the current position of the pieces on the board
  * @returns {validMovesBoardType} the Map<coord, string> of locations that the piece 
  * controlls (attacks)
  */
export function findControlledSquares(
  currentPosition: coordinateType,
  piece: pieceType,
  boardPosition: boardType
): validMovesBoardType {
  let controlledSquares = new Map() as validMovesBoardType;
  switch (piece) {
    case 'P':
      controlledSquares = findPawnControlledSquares(currentPosition, 'w');
      break;
    case 'R':
      controlledSquares = findValidRookMoves(currentPosition, boardPosition, 'w');
      break;
    case 'N':
      controlledSquares = findValidKnightMoves(currentPosition, boardPosition, 'w')
      break;
    case 'B':
      controlledSquares = findValidBishopMoves(currentPosition, boardPosition, 'w');
      break;
    case 'Q':
      controlledSquares = findValidQueenMoves(currentPosition!, boardPosition, 'w');
      break;
    case 'K':
      controlledSquares = findKingControlledSquares(currentPosition);
      break;
    case 'p':
      controlledSquares = findPawnControlledSquares(currentPosition, 'b');
      break;
    case 'r':
      controlledSquares = findValidRookMoves(currentPosition, boardPosition, 'b');
      break;
    case 'n':
      controlledSquares = findValidKnightMoves(currentPosition, boardPosition, 'b')
      break;
    case 'b':
      controlledSquares = findValidBishopMoves(currentPosition, boardPosition, 'b');
      break;
    case 'q':
      controlledSquares = findValidQueenMoves(currentPosition!, boardPosition, 'b');
      break;
    case 'k':
      controlledSquares = findKingControlledSquares(currentPosition);
      break;
  }
  return controlledSquares;
}

/**
  * Checks if square is occupied by an enemy piece
  * @param {playerType} player - the player 'w' or 'b' whose turn it is currently
  * @returns true if locToCheck is occupied by an enemy Piece
  * returns false if square is empty, or is a friendly piece
  */
export function isEnemyPiece(
  player: playerType,
  board: boardType,
  locToCheck: coordinateType
) {
  // white pieces are uppercase, black pieces are lowercase
  const piece = board.get(locToCheck);
  if (!piece) {
    return false;
  }
  if (player === 'w') {
    return /[a-z]/.test(piece);
  } else if (player === 'b') {
    return /[A-Z]/.test(piece);
  }
}

/**
  * @param {pieceType} piece - piece to check
  * @returns {boolean} true if piece is a white piece
  */
export function isWhitePiece(piece: any): boolean {
  return /[A-Z]/.test(piece);
}

/**
  * @param {pieceType} piece - piece to check
  * @returns {boolean} true if piece is a black piece
  */
export function isBlackPiece(piece: any): boolean {
  return /[a-z]/.test(piece);
}
