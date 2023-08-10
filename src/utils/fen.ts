import { boardType, coordinateType, pieceType, playerType } from "../types/Types";
import { isLetter } from "./regex";

// parse a FEN string, and prepare it to represent the position on the board.
// see source below for detailed info about each of the FEN string's components
// source: https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
export function parseFENStringBoardPosition(fen: string): boardType {
  let fenBoard = fen.split("/");
  let position: boardType = new Map();
  let row = 8;
  for (let rank of fenBoard) {
    let col = 0;
    row--;
    for (let char of rank) {
      if (isLetter(char)) {
        position.set(`${row},${col}` as coordinateType, char as pieceType);
        col++;
      } else {
        col += parseInt(char);
      }
    }
  }
  return position;
}

// parses the FEN string with the helper methods and returns
export function parseFENString(fen: string): [boardType, playerType, string, string, number, string] {
  let fenComponents = fen.split(" ");
  const position = parseFENStringBoardPosition(fenComponents[0]);
  const onMove: playerType = fenComponents[1] as playerType;
  let castlingAvailability = fenComponents[2];
  let enPassantTargetSquare = fenComponents[3];
  let halfmoveClock = parseInt(fenComponents[4]);
  let fullmoveNumber = fenComponents[5];

  return [position, onMove, castlingAvailability, enPassantTargetSquare,
    halfmoveClock, fullmoveNumber];
}

/**
  * Given a current board position, create the FEN string
  * @param board Map<string,string> where key is 'row,col' and value is the
  * string representing the piece
  * @returns FEN string
  */
export function boardPositionToFENNotation(board: boardType): string {
  let posFENString: string = "";

  for (let rank = 7; rank >= 0; rank--) {
    let skipped = 0;
    let FENrow = ""
    for (let file = 0; file <= 7; file++) {
      const current = `${rank},${file}` as coordinateType;
      if (!board.has(current)) {
        skipped++;
      } else {
        if (skipped !== 0) {
          FENrow += skipped.toString();
        }
        FENrow += board.get(current);
        skipped = 0;
      }
    }
    if (skipped !== 0) {
      FENrow += skipped.toString();
    }
    if (rank !== 0) {
      FENrow += '/';
    }
    posFENString += FENrow;
  }

  return posFENString;
}

/**
  * Given the components of a fen string, returns the full fen string
  * @param board - the current positions of the pieces (Map<string, pieceType>)
  * @param playerOnMove - 'w' or 'b'
  * @param castling - KQkq, indicating whether white or black can castle
  * @returns the full fen string
  */
export function componentsToFEN(
  board: boardType,
  playerOnMove: playerType,
  castling: string,
  enPassantTargetSquare: string,
  halfmoveClock: string | number,
  fullmoveNumber: string | number
)
  : string {

  let FENString = boardPositionToFENNotation(board) + " "
    + playerOnMove + " "
    + castling + " "
    + enPassantTargetSquare + " "
    + halfmoveClock + " "
    + fullmoveNumber;
  return FENString;
}

/**
  * Given the most recent position, returns the current player on move
  * @param {string} previous - the most recent position as a FEN string
  * @returns {playerType} - 'w' for white and 'b' for black
  */
export function nextPlayer(previous: string): playerType {
  const lastPlayer = previous.split(' ')[1];
  const currentPlayer = lastPlayer === 'w' ? 'b' : 'w';
  return currentPlayer;
}

/**
  * Gets the current move number based on the previous fen string
  * @param {string} previous - the most recent position as a FEN string
  */
export function getFullMoveNumber(previous: string): number {
  const fenComponents = previous.split(' ');
  const prevPlayer = fenComponents[1];
  const prevMoveNum = parseInt(fenComponents[5]);
  return prevPlayer === 'b' ? prevMoveNum + 1 : prevMoveNum;
}

/** handles cases where, after the rook or king moves, they can no longer castle
  * in that direction (if its a rook move), or at all (if the king moves)
  * 
  * @returns the new castling fen
  */
export function newCastlingFENPostRookOrKingMove(
  prevCastlingFEN: string,
  movedPiece: pieceType,
  movedPiecePosition: coordinateType,
): string {
  let rookOrKingMoved = false;
  let target = ['K', 'R', 'k', "r"];
  for (let t of target) {
    if (movedPiece === t) {
      rookOrKingMoved = true;
      break;
    }
  }

  if (!rookOrKingMoved) {
    return prevCastlingFEN;
  }

  const matches = /(?<white>K?Q?)(?<black>k?q?)/.exec(prevCastlingFEN)!;
  const white = matches.groups!.white;
  const black = matches.groups!.black;

  switch (movedPiece) {
    case 'K':
      return black.length === 0 ? "-" : black;
    case 'R':
      // kingside rook is moved
      if (movedPiecePosition === '0,7') {
        if (/Q/.test(white)) {
          // white can still castle queenside
          return 'Q' + black;
        }
      } else {
        // queenside rook is moved
        if (/K/.test(white)) {
          // white can still castle kingside
          return "K" + black;
        }
      }
      return black.length === 0 ? "-" : black;
    case 'k':
      return white.length === 0 ? "-" : white;
    case 'r':
      // kingside rook is moved
      if (movedPiecePosition === '7,7') {
        if (/q/.test(black)) {
          // black can still castle queenside
          return white + 'q';
        }
      } else {
        // queenside rook is moved
        if (/k/.test(black)) {
          // black can still castle kingside
          return white + 'k';
        }
      }
      return white.length === 0 ? "-" : white;
  }
  return "";
}


/**
  * returns the enpassant target square to be used in the FEN.
  * an enpassant move is possible if a 
  * pawn moves two spaces as its first move
  *
  * @param {pieceType} piece - the piece that moved
  * @param {coordinateType} fromPosition - the coordinates where the piece was BEFORE 
  * @param {coordinateType} toPosition - the coordinates the piece is AFTER
  * @returns the enpassant target square for the FEN
  */
export function getEnPassantTargetSquare(
  piece: pieceType,
  fromPosition: coordinateType,
  toPosition: coordinateType)
  : string {
  const pawnMove = piece === 'P' || piece === 'p';
  if (!pawnMove) {
    return "-";
  }
  const fromMatches = /(?<rank>\d),(?<file>\d)/.exec(fromPosition as string)!;
  const toMatches = /(?<rank>\d),(?<file>\d)/.exec(toPosition as string)!;
  const enPassantPossible: boolean =
    Math.abs(parseInt(toMatches.groups!.rank) - parseInt(fromMatches.groups!.rank)) === 2

  if (!enPassantPossible) {
    return "-";
  }
  let enpassantTargetFile
  if (parseInt(toMatches.groups!.rank) === 3) {
    enpassantTargetFile = String.fromCharCode(0x61 + parseInt(toMatches.groups!.file));
    return `${enpassantTargetFile}3`;
  } else {
    enpassantTargetFile = String.fromCharCode(0x61 + parseInt(toMatches.groups!.file));
    return `${enpassantTargetFile}6`;
  }
}

/**
  * returns the half move clock for the FEN string
  * half move clock counts the number of moves since the last capture or pawn advance
  * used for the 50 move rule
  */
export function getHalfMoveClock(
  currentHalfMoveClock: number,
  piece: pieceType,
  isCapture: boolean,
): number {
  if (piece === 'p' || piece === 'P' || isCapture) {
    return 0;
  }

  return currentHalfMoveClock + 1;
}
