import { boardType, coordinateType, playerType, validMovesBoardType } from "../types/Types";
import * as Bounds from '../utils/boardBounds';
import { isEnemyPiece } from "./validMoves";

/**
  * 
  */
export function findValidKingMoves(
  currentPosition: coordinateType,
  board: boardType,
  controlledSquares: validMovesBoardType,
  player: playerType,
  FEN: string,
  inCheck?: coordinateType
) {
  const position = currentPosition!.split(',');
  const rank = parseInt(position[0]);
  const file = parseInt(position[1]);

  const validKingMoves = new Map();

  const moves = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1]
  ];

  // check all possible king moves
  moves.forEach((value) => {
    const moveRank = rank + value[0];
    const moveFile = file + value[1];

    // check that the move is within bounds
    const withinBounds =
      moveRank <= Bounds.upper
      && moveRank >= Bounds.lower
      && moveFile <= Bounds.left
      && moveFile >= Bounds.right
    if (!withinBounds) {
      return;
    }

    const moveLocation = `${moveRank},${moveFile}` as coordinateType;

    if (controlledSquares.has(moveLocation)) {
      // this square is being controlled by an enemy piece, king cannot move here
      return;
    }

    // there is a piece in this location
    if (board.has(moveLocation)) {
      if (isEnemyPiece(player, board, moveLocation)) {
        // its an enemy piece, can capture
        validKingMoves.set(moveLocation, 'x');
      } else {
        // is a friendly piece, not possible to move here
        return;
      }
    } else {
      validKingMoves.set(moveLocation, 'm');
    }


  })

  // check castling moves
  // if king is in check, cannot castle
  if (inCheck !== null) {
    return validKingMoves;
  }

  // NOTE: check that rook is in the corner and not moved (assumed to be ok from FEN string)
  // assumed that king has not moved from FEN
  const castlingFEN = FEN.split(' ')[2];
  if (player === 'w') {
    // check if white can castle Kingside
    if (/K/.test(castlingFEN)) {
      // check if the path is free
      const pathIsFreeAndNotControlled =
        !board.has('0,5')
        && !board.has('0,6')
        && !controlledSquares.has('0,5')
        && !controlledSquares.has('0,6');

      if (pathIsFreeAndNotControlled) {
        validKingMoves.set('0,6', 'K');
        validKingMoves.set('0,7', 'K');
      }
    }
    // check if white can castle Queenside
    if (/Q/.test(castlingFEN)) {
      const pathIsFreeAndNotControlled = !board.has('0,3')
        && !board.has('0,2')
        && !board.has('0,1')
        && !controlledSquares.has('0,2')
        && !controlledSquares.has('0,3');

      if (pathIsFreeAndNotControlled) {
        validKingMoves.set('0,2', 'Q');
        validKingMoves.set('0,0', 'Q');
      }
    }
  } else {
    // black player castling
    // check if white can castle Queenside
    if (/k/.test(castlingFEN)) {
      // check if the path is free
      const pathIsFree =
        !board.has('7,5')
        && !board.has('7,6')
        && !controlledSquares.has('7,5')
        && !controlledSquares.has('7,6')

      if (pathIsFree) {
        validKingMoves.set('7,6', 'k');
        validKingMoves.set('7,7', 'k');
      }
    }
    // check if white can castle Queenside
    if (/q/.test(castlingFEN)) {
      const pathIsFree = !board.has('7,3')
        && !board.has('7,2')
        && !board.has('7,1')
        && !controlledSquares.has('7,3')
        && !controlledSquares.has('7,2');

      if (pathIsFree) {
        validKingMoves.set('7,2', 'q');
        validKingMoves.set('7,0', 'q');
      }
    }
  }
  return validKingMoves;
}

export function findKingControlledSquares(currentPosition: coordinateType) {
  const position = currentPosition!.split(",");
  let rank = parseInt(position[0]);
  let file = parseInt(position[1]);
  const controlledSquares = new Map() as validMovesBoardType;

  const moves = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1]
  ];

  moves.forEach(([offsetRank, offsetFile]) => {
    const captureRank = rank + offsetRank;
    const captureFile = file + offsetFile;

    // check that the move is within bounds
    const withinBounds =
      captureRank <= Bounds.upper
      && captureRank >= Bounds.lower
      && captureFile <= Bounds.left
      && captureFile >= Bounds.right
    if (!withinBounds) {
      return;
    }

    const controlledPos = `${captureRank},${captureFile}` as coordinateType;
    controlledSquares.set(controlledPos, 'x');
  })
  return controlledSquares;
}
