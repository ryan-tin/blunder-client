import * as FenUtil from '@/utils/fen';
import * as Types from '@/types/Types';
import { findControlledSquares, findValidMoves, isBlackPiece, isWhitePiece } from './validMoves';

// does the computational heavy lifting so that the Game/Board react components
// can be kept clean
export class Processor {
  private static _instance: Processor;
  private _fen: string;
  private _fenComponents: Types.fenComponents = {
    position: null,
    onMove: null,
    castle: null,
    enPassantTargetSquare: null,
    halfMoveClock: null,
    fullMoveNumber: null
  }
  private _positionMap: Types.boardType | null = null;
  private _kingPosition: Types.kingPosition = {
    white: null,
    black: null
  }
  private _controlledSquares: Types.controlledSquares | null = null;
  // stores the position of the king in check if there is one, else null
  private _kingCheckedPosition: Types.coordinateType | null = null;
  private _checkmate: boolean = false;
  private _stalemate: boolean = false;

  private constructor(FEN: string) {
    this._fen = FEN;
    this.RELOAD()
  }

  // getters
  // get an instance of the Processor singleton
  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    // const TESTcheckmate = '1k6/4Q3/8/8/8/5B2/8/3K4 w - - 0 1';
    // const TESTstalemate = '3k4/1Q6/8/8/8/5B2/8/3K4 w - - 12 7';
    // const TESTdiscoverCheck = 'k7/8/8/8/B7/Q7/8/3K4 w - - 0 1';
    // const TESTcannotBlockDoubleCheck = 'k1n5/8/8/8/B7/Q7/8/3K4 w - - 0 1';
    // const TESTblockingCheck = 'k7/2r5/8/8/B7/Q7/8/3K4 w - - 0 1';
    // const TESTenPassant = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1';
    // const TESTbug = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1';
    // const TESTpromotion = '1k6/1q3P2/8/8/8/8/8/2K5 w - - 0 1';
    // const TESTblackPromotion = '1k6/1q3P2/8/8/8/8/5p2/2K5 w - - 0 1';
    return this._instance || (this._instance = new this(startingFEN));
  }
  public get fen() { return this._fen; }
  public get positionMap() { return this._positionMap; }
  public get fenComponents() { return this._fenComponents; }
  public get kingPosition() { return this._kingPosition; }
  public get controlledSquares() { return this._controlledSquares; }
  public get kingCheckedPosition() { return this._kingCheckedPosition; }
  public get checkmate() { return this._checkmate; }
  public get stalemate() { return this._stalemate; }
  // getters END

  // setters
  public set FEN(newFEN: string) { this._fen = newFEN; }
  // setters END

  /**
    * refresh private variables
  * useful when there is a new FEN?
    */
  public RELOAD(): void {
    this.parseFEN();
    this._positionMap =
      FenUtil.parseFENPositionToMap(this.fenComponents.position!);
    this._kingPosition = this.findKingPosition();
    this.findControlledSquares();
    this.computeCheck();
    this.checkGameTermination();
  }

  /**
    * parse the FEN string into its component parts
    */
  private parseFEN(): void {
    [
      this._fenComponents.position,
      this._fenComponents.onMove,
      this._fenComponents.castle,
      this._fenComponents.enPassantTargetSquare,
      this._fenComponents.halfMoveClock,
      this._fenComponents.fullMoveNumber,
    ] = FenUtil.parseFENString2(this._fen);
  }

  /**
    * Find the white and black king's position in positionMap
    */
  private findKingPosition(position?: Types.boardType): Types.kingPosition {
    let kingPosition: Types.kingPosition = {
      white: null,
      black: null
    }

    for (let [coord, piece] of (position || this._positionMap!)) {
      if (piece === 'K') {
        kingPosition.white = coord;
      } else if (piece === 'k') {
        kingPosition.black = coord;
      }
    }

    return kingPosition;
  }

  /**
    * finds the controlled squares for both white and black in this position
    */
  private findControlledSquares() {
    // NOTE: this is a different to the function with the same name in validMoves.ts
    let whiteControlledSquares = new Map() as Types.validMovesBoardType;
    let blackControlledSquares = new Map() as Types.validMovesBoardType;
    for (let [coord, piece] of this._positionMap!) {
      const mapToAdd = findControlledSquares(coord, piece, this._positionMap!);
      if (isWhitePiece(piece)) {
        whiteControlledSquares = new Map([...whiteControlledSquares, ...mapToAdd]);
      } else if (isBlackPiece(piece)) {
        blackControlledSquares = new Map([...blackControlledSquares, ...mapToAdd]);
      } else {
        throw new Error('all pieces must be either black or white');
      }
    }
    this._controlledSquares = {
      white: whiteControlledSquares,
      black: blackControlledSquares
    }
  }

  /**
    * check whether the white or black king in the current position is in check
    * updates the variable if the king is, else sets it to null
    */
  private computeCheck(): void {
    if (
      this._fenComponents.onMove === 'w' &&
      this._controlledSquares!.black.has(this._kingPosition.white)) {

      this._kingCheckedPosition = this._kingPosition.white;

    } else if (
      this._fenComponents.onMove === 'b' &&
      this._controlledSquares!.white.has(this._kingPosition.black)) {

      this._kingCheckedPosition = this._kingPosition.black;

    } else {
      this._kingCheckedPosition = null;
    }

  }

  /**
    * checks for end of game conditions, i.e., stalemate & checkmate
    * and sets the respective stalemate and checkmate property flags
    */
  // TODO: add conditions
  // for 3-fold repetition
  // 50 move rule
  // insufficient material
  private checkGameTermination(): void {
    this.checkCheckmate(); // sets checkmate flag
    // stalemate: king is not in check but it (and other friendly pieces) 
    // have no legal moves
    if (this._kingCheckedPosition === null && this._checkmate) {
      this._stalemate = true;
      this._checkmate = false;
    } 
  }

  /** 
   * sets checkmate property to true if the position is checkmate
   * if the king has no legal moves and other friendly pieces also have no moves, then its checkmate
   */
  private checkCheckmate(): void {
    if (this._fenComponents.onMove === 'w') {
      const naiveKingMoves = findValidMoves('K', this._kingPosition.white, this._positionMap!, this._controlledSquares!.black, this._fen);
      const validKingMoves = this.simulateMove(naiveKingMoves, this.kingPosition.white);
      // king has legal moves, its not checkmate
      if (validKingMoves.size !== 0) {
        return;
      } else {
        // king has no moves but white pieces can block the attack
        // check all white pieces, if their true valid moves are also 0, then its checkmate
        for (const [c, p] of this._positionMap!) {
          if (isBlackPiece(p)) {
            continue;
          }
          const naivePieceMoves = findValidMoves(p, c, this._positionMap!, this._controlledSquares!.black, this._fen);
          const validMoves = this.simulateMove(naivePieceMoves, c);
          // a piece can block, its not checkmate
          if (validMoves.size !== 0) {
            return;
          }
        }
      }
    } else {
      const naiveKingMoves = findValidMoves('k', this._kingPosition.black, this._positionMap!, this._controlledSquares!.white, this._fen);
      const validKingMoves = this.simulateMove(naiveKingMoves, this._kingPosition.black);
      // king has legal moves, its not checkmate
      if (validKingMoves.size !== 0) {
        return;
      } else {
        // king has no moves but white pieces can block the attack
        // check all white pieces, if their true valid moves are also 0, then its checkmate
        for (const [c, p] of this._positionMap!) {
          if (isWhitePiece(p)) {
            continue;
          }
          const naivePieceMoves = findValidMoves(p, c, this._positionMap!, this._controlledSquares!.white, this._fen);
          const validMoves = this.simulateMove(naivePieceMoves, c);
          // a piece can block, its not checkmate
          if (validMoves.size !== 0) {
            return;
          }
        }
      }
    }
    // there are no legal moves, king cannot move, and no pices can block
    this._checkmate = true;
  }

  /**
    * Find the true valid moves of a piece at the targetCoord by simulating
    * its candidate moves
    * @param {Types.validMovesBoardType} candidateMoves - the candidate valid moves of the target piece 
    * @param {Types.validMovesBoardType} targetCoord - the location of the piece to find the valid move for
    */
  public simulateMove(
    candidateMoves: Types.validMovesBoardType,
    targetCoord: Types.coordinateType
  ) {
    const trueValidMoves = new Map();

    candidateMoves.forEach((value, coord) => {
      const simulatedPosition = new Map([...this._positionMap!]); // clone position
      const movedPiece = simulatedPosition.get(targetCoord);
      simulatedPosition.delete(targetCoord);
      simulatedPosition.set(coord, movedPiece!);
      // check all enemy moves
      // if any are a capture of the king, then this move is not valid
      for (let [c, p] of simulatedPosition) {
        // skip our own pieces
        if (this._fenComponents.onMove === 'w') {
          if (!/[a-z]/.test(p)) {
            continue;
          }
        } else if (this._fenComponents.onMove === 'b') {
          if (!/[A-Z]/.test(p)) {
            continue;
          }
        }
        // the simulated controlled squares for this enemy piece
        const simulatedEnemyControlledSquares =
          findControlledSquares(c, p, simulatedPosition);
        // if the king can be captured, this is not a valid move
        const kingPositions = this.findKingPosition(simulatedPosition);
        const kingPos = this._fenComponents.onMove === 'w' ?
          kingPositions.white : kingPositions.black;

        if (simulatedEnemyControlledSquares.has(kingPos)) {
          // this position is illegal
          return;
        }
      }
      trueValidMoves.set(coord, value);
    })
    return trueValidMoves;
  }

}
