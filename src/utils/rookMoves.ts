import { boardType, coordinateType, playerType, } from "../types/Types";
import { findStraightLineMoves } from "./directionalMoves";

/**
  * Finds the valid rook moves and captures
  * @param currentPosition the current location of the rook
  * @param board Map of the location of all pieces
  * @param player white or black rook
  * @returns a Map of valid moves with key as location and value as 'm'
  * for move, or 'x' for capture
  */
export function findValidRookMoves(
  currentPosition: coordinateType,
  board: boardType,
  player: playerType) {

  const validRookMoves = findStraightLineMoves(currentPosition, board, player);

  return validRookMoves;
}
