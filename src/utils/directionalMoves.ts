import { boardType, coordinateType, playerType } from "../types/Types";
import * as Bounds from "./boardBounds";
import { isEnemyPiece } from "./validMoves";

export function findStraightLineMoves(
  currentPosition: coordinateType, 
  board: boardType,
  player: playerType
) {
  const position = currentPosition!.split(',');
  const rank = parseInt(position[0]);
  const file = parseInt(position[1]);
  const validStraightLineMoves = new Map();
  for (let currentRank = rank + 1; currentRank <= Bounds.upper; currentRank++) {
    // check that position is empty or if theres a piece, its an enemy piece
    const current = `${currentRank},${file}` as coordinateType;
    if (board.has(current)) {
      // there is a piece in this location
      if (isEnemyPiece(player, board, current)) {
        // its an enemy piece
        validStraightLineMoves.set(current, 'x');
        break;
      } else {
        // stop if friendly piece
        break;
      }
    } else {
      // empty square, can move there
      validStraightLineMoves.set(current, 'm');
    }
  }

  // left
  for (let currentFile = file + 1; currentFile <= Bounds.left; currentFile++) {
    // check that position is empty or if theres a piece, its an enemy piece
    const current = `${rank},${currentFile}` as coordinateType;
    if (board.has(current)) {
      // there is a piece in this location
      if (isEnemyPiece(player, board, current)) {
        // its an enemy piece
        validStraightLineMoves.set(current, 'x');
        break;
      } else {
        // stop if friendly piece
        break;
      }
    } else {
      // empty square, can move there
      validStraightLineMoves.set(current, 'm');
    }
  }

  // down
  for (let currentRank = rank - 1; currentRank >= Bounds.lower; currentRank--) {
    // check that position is empty or if theres a piece, its an enemy piece
    const current = `${currentRank},${file}` as coordinateType;
    if (board.has(current)) {
      // there is a piece in this location
      if (isEnemyPiece(player, board, current)) {
        // its an enemy piece
        validStraightLineMoves.set(current, 'x');
        break;
      } else {
        // stop if friendly piece
        break;
      }
    } else {
      // empty square, can move there
      validStraightLineMoves.set(current, 'm');
    }
  }

  // right
  for (let currentFile = file - 1; currentFile >= Bounds.right; currentFile--) {
    // check that position is empty or if theres a piece, its an enemy piece
    const current = `${rank},${currentFile}` as coordinateType;
    if (board.has(current)) {
      // there is a piece in this location
      if (isEnemyPiece(player, board, current)) {
        // its an enemy piece
        validStraightLineMoves.set(current, 'x');
        break;
      } else {
        // stop if friendly piece
        break;
      }
    } else {
      // empty square, can move there
      validStraightLineMoves.set(current, 'm');
    }
  }
  return validStraightLineMoves;
}

export function findDiagonalMoves(
  currentPosition: coordinateType, 
  board: boardType,
  player: playerType
) {
  const position = currentPosition!.split(',');
  const rank = parseInt(position[0]);
  const file = parseInt(position[1]);

  const validDiagonalMoves = new Map();
  // northeast (white's perspective)
  let refRank = rank + 1;
  let refFile = file - 1;
  while (refRank <= Bounds.upper && refFile >= Bounds.right) {
    const current = `${refRank},${refFile}` as coordinateType;
    if (board.has(current)) {
      if (isEnemyPiece(player, board, current)) {
        // can capture an enemy piece
        validDiagonalMoves.set(current, 'x');
        break;
      } else {
        // is a friendly piece
        break;
      }
    }
    // is ean empty square
    validDiagonalMoves.set(current, 'm');
    refRank++;
    refFile--;
  }

  // northwest
  refRank = rank + 1;
  refFile = file + 1;
  while (refRank <= Bounds.upper && refFile <= Bounds.left) {
    const current = `${refRank},${refFile}` as coordinateType;
    if (board.has(current)) {
      if (isEnemyPiece(player, board, current)) {
        // can capture an enemy piece
        validDiagonalMoves.set(current, 'x');
        break;
      } else {
        // is a friendly piece
        break;
      }
    }
    // is ean empty square
    validDiagonalMoves.set(current, 'm');
    refRank++;
    refFile++;
  }

  // southeast
  refRank = rank - 1;
  refFile = file - 1;
  while (refRank >= Bounds.lower && refFile >= Bounds.right) {
    const current = `${refRank},${refFile}` as coordinateType;
    if (board.has(current)) {
      if (isEnemyPiece(player, board, current)) {
        // can capture an enemy piece
        validDiagonalMoves.set(current, 'x');
        break;
      } else {
        // is a friendly piece
        break;
      }
    }
    // is ean empty square
    validDiagonalMoves.set(current, 'm');
    refRank--;
    refFile--;
  }

  // southwest
  refRank = rank - 1;
  refFile = file + 1;
  while (refRank >= Bounds.lower && refFile <= Bounds.left) {
    const current = `${refRank},${refFile}` as coordinateType;
    if (board.has(current)) {
      if (isEnemyPiece(player, board, current)) {
        // can capture an enemy piece
        validDiagonalMoves.set(current, 'x');
        break;
      } else {
        // is a friendly piece
        break;
      }
    }
    // is ean empty square
    validDiagonalMoves.set(current, 'm');
    refRank--;
    refFile++;
  }

  return validDiagonalMoves;
}
