import { boardType, coordinateType, playerType } from "../types/Types";
import { findDiagonalMoves, findStraightLineMoves } from "./directionalMoves";

export function findValidQueenMoves(
  currentPosition: coordinateType,
  board: boardType,
  player: playerType
) {
  const validStraightLineQueenMoves = findStraightLineMoves(currentPosition, board, player);
  const validDiagonalQueenMoves = findDiagonalMoves(currentPosition, board, player);
  return new Map([...validStraightLineQueenMoves, ...validDiagonalQueenMoves]);
}
