'use client'

import { useEffect, useState } from 'react';
import Square from './Square';
import Piece from './pieces//Piece';
import Panel, { PanelProps } from './Panel';
import Promotion from './Promotion';
import {
  boardType,
  coordinateType,
  pieceType,
  playerType,
  validMovesBoardType
} from '../types/Types';
import {
  findControlledSquares,
  findValidMoves,
  handleFindValidMoves,
  isBlackPiece,
  isEnemyPiece,
  isWhitePiece
} from '../utils/validMoves';
import {
  componentsToFEN,
  getEnPassantTargetSquare,
  getFullMoveNumber,
  getHalfMoveClock,
  newCastlingFENPostRookOrKingMove,
  nextPlayer,
  parseFENString
} from '../utils/fen';
import boardstyles from '@/styles/Board.module.css';

interface boardProps {
  FEN: string;
  perspective: playerType;
  sendMove: Function;
}

const DEBUG = true;

export default function Board(props: boardProps) {
  // const [FEN, setFEN] = useState(props.FEN)
  const FEN = props.FEN

  let [position, onMove, castlingFEN, enPassantTargetSquare,
    halfmoveClock, fullmoveNumber] = parseFENString(props.FEN);

  // Map containing valid moves
  // key is a string, the 'row,col' of the move
  // value is 'm' if its a move, or 'x' if its a capture
  const [validMoves, setValidMoves] = useState(new Map() as validMovesBoardType);
  // selectedPiece is the position of the currently selected piece
  const [selectedPiece, setSelectedPiece] = useState(null as coordinateType);

  const [checkPosition, setCheckPosition] = useState(null as coordinateType);

  // NOTE: rook, knight, bishop does not consider a square with a friendly piece
  // to be "controlled". is this a problem?
  const [controlledSquares, setControlledSquares] = useState(new Map() as validMovesBoardType);

  const [panelProps, setPanelProps] = useState({ checkmate: false } as PanelProps);

  // states used for pawn promotion
  const [showPromotion, setShowPromotion] = useState(false);
  const [promotionSquareCoord, setPromotionSquareCoord] = useState(null as coordinateType);

  const boardSquares = prepareBoard();

  // Checking the king changes background
  // if the king is in one of the controlled squares, then it is in check
  useEffect(() => {
    const whiteKingPos = findKingPosition('w');
    const blackKingPos = findKingPosition('b');
    if (onMove === 'b' && controlledSquares!.has(blackKingPos)) {
      setCheckPosition(blackKingPos);
      const checkmate = checkCheckmate();
      setPanelProps({
        checkmate: checkmate,
        winningPlayer: 'w'
      });
    } else if (onMove === 'w' && controlledSquares!.has(whiteKingPos)) {
      setCheckPosition(whiteKingPos);
      const checkmate = checkCheckmate();
      setPanelProps({
        checkmate: checkmate,
        winningPlayer: 'b'
      });
    } else {
      setCheckPosition(null);
    }
  }, [controlledSquares]);

  /** 
   * @returns true if the position is checkmate
   */
  function checkCheckmate() {
    // if the king has no legal moves and other friendly pieces also have no moves, then its checkmate
    //
    // if the king has legal moves, return false early
    if (onMove === 'w') {
      const whiteKingPos = findKingPosition('w');
      const validKingMoves = findValidMoves('K', whiteKingPos, position, controlledSquares, FEN);
      const trueValidKingMoves = simulateMove(validKingMoves, position, whiteKingPos);
      if (trueValidKingMoves.size !== 0) {
        return false;
      } else {
        // check all friendly pieces, if their true valid moves are also 0, then 
        for (const [c, p] of position) {
          if (isBlackPiece(p)) {
            continue;
          }
          const validPieceMoves = findValidMoves(p, c, position, controlledSquares, FEN);
          const trueValidMoves = simulateMove(validPieceMoves, position, c);
          if (trueValidMoves.size !== 0) {
            return false;
          }
        }
        // there are no legal moves
        return true;
      }
    } else {
      const blackKingPos = findKingPosition('b')
      const validKingMoves = findValidMoves('k', blackKingPos, position, controlledSquares, FEN);
      const trueValidKingMoves = simulateMove(validKingMoves, position, blackKingPos);
      if (trueValidKingMoves.size !== 0) {
        return false;
      } else {
        // check all friendly pieces, if their true valid moves are also 0, then 
        for (const [c, p] of position) {
          if (isWhitePiece(p)) {
            continue;
          }
          const validPieceMoves = findValidMoves(p, c, position, controlledSquares, FEN);
          const trueValidMoves = simulateMove(validPieceMoves, position, c);
          if (trueValidMoves.size !== 0) {
            return false;
          }
        }
        // there are no legal moves
        return true;
      }
    }
  }

  /**
   * given a perspective
   * @param perspective 'w' or 'b'
   * @param piecePositions key is location on board, value is piece
   * @returns an array of elements
   */
  function prepareBoard() {
    let boardSquares: any[] = [];
    if (props.perspective === 'b') {
      boardSquares = prepareBlackBoard();
    } else if (props.perspective === 'w') {
      boardSquares = prepareWhiteBoard();
    }
    return boardSquares;
  }

  // prepare the board from white's perspective
  function prepareWhiteBoard() {
    let boardSquares = [];
    // these abbreviations represent the possible moves, 
    // m - move
    // K - white kingside castle
    // Q - white queenside castle
    // k - black kingside castle
    // q - black queenside castle
    // e - enpassant
    const validMoveAbbrevs = ['m', 'K', 'Q', 'k', 'q', 'e'];

    for (let row = 7; row >= 0; row--) {
      let boardRow = [];
      for (let col = 7; col >= 0; col--) {
        let currentPosition = `${row},${col}` as coordinateType;
        let hasPiece = position.has(currentPosition);
        let piece: any = hasPiece ? position.get(currentPosition) : "";

        let isValidMove = false;
        // player can only move their own piece
        if (onMove === 'w') {
          if (validMoves.has(currentPosition)) {
            for (let move of validMoveAbbrevs) {
              if (validMoves.get(currentPosition) === move) {
                isValidMove = true;
                break;
              }
            }
          }
        }

        const canCapture =
          validMoves.has(currentPosition) &&
          (
            validMoves.get(currentPosition) === 'x'
            // castling shares the same visual graphic as a capture
            || (validMoves.get(currentPosition) === 'K' && currentPosition === '0,7')
            || (validMoves.get(currentPosition) === 'Q' && currentPosition === '0,0')
            || (validMoves.get(currentPosition) === 'k' && currentPosition === '7,7')
            || (validMoves.get(currentPosition) === 'q' && currentPosition === '7,0')
          )

        let value = (row * 8) + col;
        let child = (
          <Piece
            pieceType={piece}
            coordinates={`${row},${col}` as coordinateType}
          />
        )

        boardRow.unshift(
          <span key={value} >
            <Square
              key={value} value={value} row={row} col={col}
              isValidMove={isValidMove}
              isSelected={selectedPiece === currentPosition}
              canCapture={canCapture}
              inCheck={checkPosition === currentPosition}
              controlled={controlledSquares.has(currentPosition)}
            >
              {child}
            </Square>
          </span >
        );
      }
      boardSquares.push(
        <div key={row} className={boardstyles["Board-row-container"]}>
          {boardRow}
        </div>
      )
    }
    return boardSquares;
  }

  function prepareBlackBoard() {
    let boardSquares = [];
    const validMoveAbbrevs = ['m', 'K', 'Q', 'k', 'q', 'e'];

    for (let row = 0; row < 8; row++) {
      const boardRow = [];
      for (let col = 0; col < 8; col++) {
        let currentPosition: coordinateType = `${row},${col}` as coordinateType;
        // prepare arguments for renderSquare
        // check whether there is a piece in this position
        const hasPiece = position.has(currentPosition);
        const piece: any = hasPiece ? position.get(currentPosition) : "";

        let isValidMove = false;
        if (onMove === 'b') {
          // and whether this is a valid move (if a piece is clicked)
          if (validMoves.has(currentPosition)) {
            for (let move of validMoveAbbrevs) {
              if (validMoves.get(currentPosition) === move) {
                isValidMove = true;
                break;
              }
            }
          }
        }

        // and whether piece in this square can be captured
        const canCapture =
          validMoves.has(currentPosition) &&
          (
            validMoves.get(currentPosition) === 'x'
            || (validMoves.get(currentPosition) === 'K' && currentPosition === '0,7')
            || (validMoves.get(currentPosition) === 'Q' && currentPosition === '0,0')
            || (validMoves.get(currentPosition) === 'k' && currentPosition === '7,7')
            || (validMoves.get(currentPosition) === 'q' && currentPosition === '7,0')
          )

        let value = (row * 8) + col;
        let child =
          <Piece
            pieceType={piece}
            coordinates={`${row},${col}` as coordinateType}
          />;

        boardRow.unshift(
          <span key={value} >
            <Square
              key={value} value={value} row={row} col={col}
              isValidMove={isValidMove}
              isSelected={selectedPiece === currentPosition}
              canCapture={canCapture}
              inCheck={checkPosition === currentPosition}
            >
              {child}
            </Square>
          </span>
        );
      }
      boardSquares.push(
        <div key={row} className={boardstyles["Board-row-container"]}>
          {boardRow}
        </div>
      )
    }
    return boardSquares;
  }

  function findKingPosition(player: playerType, passedBoardPosition?: boardType): coordinateType {
    if (passedBoardPosition == null) {
      if (player === 'w') {
        for (let [coord, piece] of position) {
          if (piece === 'K') {
            return coord;
          }
        }
      } else {
        for (let [coord, piece] of position) {
          if (piece === 'k') {
            return coord;
          }
        }
      }
      return null;
    } else {
      if (player === 'w') {
        for (let [coord, piece] of passedBoardPosition) {
          if (piece === 'K') {
            return coord;
          }
        }
      } else {
        for (let [coord, piece] of passedBoardPosition) {
          if (piece === 'k') {
            return coord;
          }
        }
      }
    }
    return null;
  }

  function castleKing(currentPosition: coordinateType): void {
    const castleDirection = validMoves.get(currentPosition);

    const matches = /(?<white>K?Q?)(?<black>k?q?)/.exec(castlingFEN)!;
    let white = matches.groups!.white;
    let black = matches.groups!.black;
    let nextCastlingFEN =
      castleDirection === 'K' || castleDirection === 'Q' ?
        black : white;
    // empty castling fen is '-'
    if (nextCastlingFEN.length === 0) {
      nextCastlingFEN = "-";
    }

    // increment the halfmove clock, not a capture or pawn advance
    halfmoveClock++;

    // move the king and rook
    // remove the king
    position.delete(selectedPiece);
    const nextPosition = new Map(position);
    switch (castleDirection) {
      case 'K':
        nextPosition.delete('0,7'); // remove the rook
        nextPosition.set('0,6', 'K');
        nextPosition.set('0,5', 'R');
        break;
      case 'Q':
        nextPosition.delete('0,0'); // remove the rook
        nextPosition.set('0,2', 'K');
        nextPosition.set('0,3', 'R');
        break;
      case 'k':
        nextPosition.delete('7,7'); // remove the rook
        nextPosition.set('7,6', 'k');
        nextPosition.set('7,5', 'r');
        break;
      case 'q':
        nextPosition.delete('7,0'); // remove the rook
        nextPosition.set('7,2', 'k');
        nextPosition.set('7,3', 'r');
        break;
    }

    // get the new FEN
    const newFENString = componentsToFEN(
      nextPosition,
      nextPlayer(FEN),
      nextCastlingFEN,
      '-', // no empassant target square after castling
      halfmoveClock.toString(),
      getFullMoveNumber(FEN)
    );
    // set new FEN to update the board position
    props.sendMove(newFENString);
    clear();
    setControlledSquares(getControlledSquares(nextPosition));
  }

  function performMove(currentPosition: coordinateType) {
    // handle special case for enpassant
    if (validMoves.get(currentPosition) === 'e') {
      const matches = /(?<rank>[\d]),(?<file>[\d])/.exec(currentPosition!);
      let rank = parseInt(matches?.groups!.rank!);
      const file = parseInt(matches?.groups!.file!);
      rank = onMove === 'w' ? rank - 1 : rank + 1;
      position.delete(`${rank},${file}` as coordinateType);
    }
    const movedPiece: pieceType = position.get(selectedPiece) as pieceType;
    const nextCastlingFEN = newCastlingFENPostRookOrKingMove(castlingFEN, movedPiece, selectedPiece);

    position.delete(selectedPiece);
    // move the piece
    const nextPosition = new Map(position);
    nextPosition.set(currentPosition, movedPiece);

    // get the enpassant target square
    const enpassantTargetSquare = getEnPassantTargetSquare(movedPiece, selectedPiece, currentPosition);

    // get the halfmove clock
    const isCapture: boolean = validMoves.get(currentPosition) === 'x';
    halfmoveClock = getHalfMoveClock(halfmoveClock, movedPiece, isCapture);

    clear();
    setControlledSquares(getControlledSquares(nextPosition));

    // create the new FEN
    const newFENString = componentsToFEN(
      nextPosition,
      nextPlayer(FEN),
      nextCastlingFEN,
      enpassantTargetSquare,
      halfmoveClock.toString(),
      getFullMoveNumber(FEN)
    );
    // set new FEN to update the board position
    props.sendMove(newFENString);
  }

  /**
   * Returns a map of the controlled squares in the current position
   */
  function getControlledSquares(nextPosition: boardType) {
    let controlledSquares = new Map() as validMovesBoardType;
    for (let [coord, piece] of nextPosition) {
      if (!isEnemyPiece(onMove, nextPosition, coord)) {
        const mapToAdd = findControlledSquares(coord, piece, nextPosition);
        controlledSquares = new Map([...controlledSquares, ...mapToAdd]);
      }
    }
    return controlledSquares;
  }

  // clear valid moves and selected piece highlight
  function clear() {
    setSelectedPiece(null);
    setValidMoves(new Map());
  }

  function handleClick(event: any) {
    let currentPosition = event.target.id;
    let source = event.target.offsetParent.className;

    const castlingMoves = ['K', 'Q', 'k', 'q'];
    let castle = false;
    for (let move of castlingMoves) {
      if (validMoves.get(currentPosition) === move) {
        castle = true;
        break;
      }
    }

    // promotion move
    if (source.includes('promotion')) {
      // remove the pawn and replace it with the piece
      let piece = undefined;
      if (/Queen/.test(event.target.alt)) {
        piece = onMove === 'b' ? 'Q' : 'q';
      } else if (/Knight/.test(event.target.alt)) {
        piece = onMove === 'b' ? 'N' : 'n';
      } else if (/Rook/.test(event.target.alt)) {
        piece = onMove === 'b' ? 'R' : 'r';
      } else if (/Bishop/.test(event.target.alt)) {
        piece = onMove === 'b' ? 'B' : 'b';
      }

      if (piece !== undefined) {
        const nextPosition = new Map(position);
        nextPosition.delete(promotionSquareCoord);
        nextPosition.set(promotionSquareCoord, piece as pieceType);
        const nextFENString = componentsToFEN(
          nextPosition,
          onMove,
          castlingFEN,
          '-',
          halfmoveClock,
          fullmoveNumber
        );
        setShowPromotion(false);
        onMove = onMove === 'w' ? 'b' : 'w'; // HACK:
        setControlledSquares(getControlledSquares(nextPosition));
        props.sendMove(nextFENString);
      }
    }
    // valid castling move is clicked
    else if (castle) {
      castleKing(currentPosition);
    }
    // if a valid Move is clicked, move the piece there
    else if (validMoves.has(currentPosition) && props.perspective === onMove) {
      const piece = position.get(selectedPiece);
      const rankMatcher = /(?<rank>[\d]),[\d]/.exec(currentPosition);
      const rank = rankMatcher!.groups!.rank;
      if (
        (piece === 'p' && rank === '0')
        || (piece === 'P' && rank === '7')
      ) {
        // move is a pawn promotion
        setShowPromotion(true);
        setPromotionSquareCoord(currentPosition);
      } else {
        setShowPromotion(false);
        setPromotionSquareCoord(null);
      }
      performMove(currentPosition);
    }
    // if the same piece is clicked twice, clear valid moves and selected highlight
    else if (selectedPiece === currentPosition) {
      clear();
    }
    // if a piece is clicked, show its valid moves
    // can only click on your own pieces
    else if (position.has(currentPosition) &&
      // its white's turn and a white piece is clicked OR
      // its black's turn and a black piece is clicked
      (
        (onMove === 'w' && isWhitePiece(position.get(currentPosition)))
        || (onMove === 'b' && isBlackPiece(position.get(currentPosition)))
      ) &&
      (props.perspective === onMove)
    ) {
      let nextValidMoves = handleFindValidMoves(
        event.target,
        currentPosition,
        position,
        controlledSquares,
        FEN,
        checkPosition
      );
      // for each valid move
      // simulate this move to check if it is truly vaild
      const trueValidMoves = simulateMove(nextValidMoves, position, currentPosition);

      setValidMoves(trueValidMoves);
      // change background color to indicate piece is selected
      setSelectedPiece(currentPosition)
    }
    // reset if an empty square is clicked
    else {
      clear();
    }
  }

  // For each valid move found, simulate this move, and check all enenmy 
  function simulateMove(
    validMoves: validMovesBoardType,
    position: boardType,
    pieceCoord: coordinateType
  ) {
    const trueValidMoves = new Map();

    validMoves.forEach((value, coord) => {
      const simulatedPosition = new Map([...position]); // clone position
      const movedPiece = simulatedPosition.get(pieceCoord);
      simulatedPosition.delete(pieceCoord);
      simulatedPosition.set(coord, movedPiece!);
      // check all enemy moves
      // if any are a capture of the king, then this move is not valid
      for (let [c, p] of simulatedPosition) {
        // skip our own pieces
        if (onMove === 'w') {
          if (!/[a-z]/.test(p)) {
            continue;
          }
        } else if (onMove === 'b') {
          if (!/[A-Z]/.test(p)) {
            continue;
          }
        }
        // the simulated controlled for this enemy piece
        const simulatedEnemyControlledSquares = findControlledSquares(c, p, simulatedPosition);
        // if the king can be captured, this is not a valid move
        const simulatedKingPos = findKingPosition(onMove, simulatedPosition);

        if (simulatedEnemyControlledSquares.has(simulatedKingPos)) {
          // this position is illegal
          return;
        }
      }
      trueValidMoves.set(coord, value);
    })
    return trueValidMoves;
  }

  return (
    <div>
      {DEBUG && <p>{FEN}</p>}
      <div
        onClick={handleClick}
      >
        {showPromotion && <Promotion
          player='w'
          promotionSquareCoord={promotionSquareCoord}
        />}
      </div>
      <div className={boardstyles['Board-container']}
        onClick={handleClick}
      >
        {boardSquares}
      </div>
      <div className={boardstyles["panel-container"]}>
        <Panel
          checkmate={panelProps.checkmate}
          winningPlayer={panelProps.winningPlayer}
        />
      </div>
    </div>
  );
}
