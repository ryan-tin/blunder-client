import { boardType, coordinateType, playerType } from "../types/Types";
import { findDiagonalMoves } from "./directionalMoves";

export function findValidBishopMoves(
  currentPosition: coordinateType,
  board: boardType,
  player: playerType
) {
  const validBishopMoves = findDiagonalMoves(currentPosition, board, player);
  return validBishopMoves;
}
