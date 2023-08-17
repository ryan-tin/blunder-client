import { boardType, coordinateType, playerType, validMovesBoardType, } from "../types/Types";
import { isEnemyPiece } from "./validMoves";
import * as Bounds from './boardBounds';

export function findValidPawnMoves(
  currentPosition: string,
  board: boardType,
  player: playerType,
  FEN?: string
) {
  let enpassantFEN;
  if (FEN !== undefined) {
    const FENComponents = FEN.split(' ');
    enpassantFEN = FENComponents[3];
  }
  const position = currentPosition.split(",");
  let rank = parseInt(position[0]);
  let file = parseInt(position[1]);

  let validMoves = new Map();
  if (player === 'w') {
    // check forward moves
    // pawn can move two squares if its the first move
    let forwardMoves = rank === 1 ? 2 : 1;
    let refRow = rank;
    let refCol = file;
    while (forwardMoves > 0) {
      const hasPiece = board.has(`${++refRow},${refCol}` as coordinateType);
      if (hasPiece) {
        // pawn cannot move forward if square is taken by another piece
        break;
      }
      validMoves.set(`${refRow},${refCol}`, 'm'); // 'm' for move
      forwardMoves--;
    }

    // add attacking moves
    let attackingMoves;
    if (enpassantFEN !== '-') {
      attackingMoves = findPawnAttackingMoves(currentPosition, board, player, enpassantFEN);
    } else {
      attackingMoves = findPawnAttackingMoves(currentPosition, board, player);
    }

    validMoves = new Map([...validMoves, ...attackingMoves]);

  } else if (player === 'b') { // BLACK PAWN
    let refRank = rank;
    let refFile = file;
    // check forward moves
    let forwardMoves = rank === 6 ? 2 : 1;
    while (forwardMoves > 0) {
      const hasPiece = board.has(`${--refRank},${refFile}` as coordinateType);
      if (hasPiece) {
        // pawn cannot move forward if square is taken by another piece
        break;
      }
      validMoves.set(`${refRank},${refFile}`, 'm');
      forwardMoves--;
    }

    // attacking moves
    let attackingMoves;
    if (enpassantFEN !== '-') {
      attackingMoves = findPawnAttackingMoves(currentPosition, board, player, enpassantFEN);
    } else {
      attackingMoves = findPawnAttackingMoves(currentPosition, board, player);
    }

    validMoves = new Map([...validMoves, ...attackingMoves]);

  }
  return validMoves;
}

/**
  * Find the squares that a pawn can cature
  * returns a Map
  */
function findPawnAttackingMoves(
  currentPosition: string,
  board: boardType,
  player: playerType,
  enpassantFEN?: string
) {
  const position = currentPosition.split(",");
  let rank = parseInt(position[0]);
  let file = parseInt(position[1]);
  let attackingMoves = new Map() as validMovesBoardType;

  const diagonalCaptures = [
    // white diagonal captures
    [1, 1],
    [1, -1],
    // black diagonal captures
    [-1, -1],
    [-1, 1]
  ]

  diagonalCaptures.forEach(([offsetRank, offsetFile], index) => {
    if (player === 'w' && index >= 2) {
      return;
    } else if (player === 'b' && index <= 1) {
      return;
    }
    const diagonalCapturePos = `${rank + offsetRank},${file + offsetFile}` as coordinateType;
    if (isEnemyPiece(player, board, diagonalCapturePos)) {
      attackingMoves.set(diagonalCapturePos, 'x');
    }
  })

  // handle enpassant case
  if (enpassantFEN === undefined) {
    return attackingMoves;
  }

  // convert enpassasntFEN to a location of where to display valid move
  const matches = /([a-z])/.exec(enpassantFEN);
  // let enpassantRank: string = String.fromCharCode(0x61 + parseInt(matches![1]));
  let enpassantFile = matches![1].charCodeAt(0) - 97;
  if (player === 'w') {
    const enpassantCoord: coordinateType = `5,${enpassantFile}` as coordinateType;
    const enpassantRank = 5;
    const locations = [
      [-1,-1],
      [-1,1]
    ]
    locations.forEach(([rankOffset, fileOffset]) => {
      let pawnLoc = `${enpassantRank + rankOffset},${enpassantFile + fileOffset}` as coordinateType;
      if (board.get(pawnLoc) === 'P' && currentPosition === pawnLoc) {
        attackingMoves.set(enpassantCoord, 'e');
      }
    })
  } else {
    const enpassantCoord: coordinateType = `2,${enpassantFile}` as coordinateType;
    const enpassantRank = 2;
    const locations = [
      [1,-1],
      [1,1]
    ]
    locations.forEach(([rankOffset, fileOffset]) => {
      let pawnLoc = `${enpassantRank + rankOffset},${enpassantFile + fileOffset}` as coordinateType;
      if (board.get(pawnLoc) === 'p' && currentPosition === pawnLoc) {
        attackingMoves.set(enpassantCoord, 'e');
      }
    })
  }

  return attackingMoves;
}

/**
  * Finds the squares that a pawn controls (currently attacks)
  * this is simiarl to findPawnAttackingMoves, but does not require an enemy piece
  * to be at the attacked location
  * returns a map
  */
export function findPawnControlledSquares(
  currentPosition: coordinateType,
  player: playerType
) {
  const position = currentPosition!.split(",");
  let rank = parseInt(position[0]);
  let file = parseInt(position[1]);
  let controlledSquares = new Map<coordinateType, 'x'>();

  const diagonalCaptures = [
    // white diagonal captures
    [1, 1],
    [1, -1],
    // black diagonal captures
    [-1, -1],
    [-1, 1]
  ]

  diagonalCaptures.forEach(([offsetRank, offsetFile], index) => {
    if (player === 'w' && index >= 2) {
      return;
    } else if (player === 'b' && index <= 1) {
      return;
    }
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

    const diagonalCapturePos = `${captureRank},${captureFile}` as coordinateType;
    controlledSquares.set(diagonalCapturePos, 'x');
  })
  return controlledSquares;
}
