import { boardType, coordinateType, playerType } from "../types/Types";
import * as Bounds from '../utils/boardBounds';
import { isEnemyPiece } from "./validMoves";

export function findValidKnightMoves(
  currentPosition: coordinateType,
  board: boardType,
  player: playerType
) {
  const position = currentPosition!.split(',');
  const rank = parseInt(position[0]);
  const file = parseInt(position[1]);
  const validKnightMoves = new Map();
  const moves = [
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
    [1, 2],
    [2, 1]
  ];

  // check all possible knight moves
  moves.forEach((value) => {
    // find new location
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
    // there is a piece in this location
    if (board.has(moveLocation)) {
      if (isEnemyPiece(player, board, moveLocation)) {
        // its an enemy piece, can capture
        validKnightMoves.set(moveLocation, 'x');
      } else {
        // is a friendly piece, not possible to move here
        return;
      }
    } else {
      validKnightMoves.set(moveLocation, 'm');
    }
  })

  return validKnightMoves;
}
