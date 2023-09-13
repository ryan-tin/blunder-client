'use client'

import { useState } from 'react';
import Square from './Square';
import Piece from './pieces//Piece';
import Panel, { PanelProps } from './Panel';
import Promotion from './Promotion';
import {
  boardType,
  coordinateType,
  pieceType,
  playerType,
  validMovesBoardType,
  fenComponents,
  controlledSquares
} from '@/types/Types';
import {
  handleFindValidMoves,
  isBlackPiece,
  isWhitePiece
} from '@/utils/validMoves';
import {
  componentsToFEN,
  getEnPassantTargetSquare,
  getFullMoveNumber,
  getHalfMoveClock,
  newCastlingFENPostRookOrKingMove,
  nextPlayer,
} from '@/utils/fen';
import boardstyles from '@/styles/Board.module.css';
import { Processor } from '@/utils/Processor';

interface boardProps {
  FEN: string;
  perspective: playerType;
  sendMove: Function;
}

const DEBUG = true;

export default function Board(props: boardProps) {
  const processor = Processor.Instance;
  const FEN = props.FEN;
  // FEN changes when opponent sends it through the websocket
  // recompute values every time the FEN changes
  processor.RELOAD();


  const positionMap: boardType = processor.positionMap as boardType;
  const fenComponents: fenComponents = processor.fenComponents;
  const controlledSquares: controlledSquares =
    processor.controlledSquares as controlledSquares;
  const checkPosition: coordinateType = processor.kingCheckedPosition;

  // game termination panel: stalemate & checkmate
  const checkmateFlag: boolean = processor.checkmate;
  const stalemateFlag: boolean = processor.stalemate;
  let panelProps = {
    checkmate: false,
    stalemate: false
  } as PanelProps;

  if (checkmateFlag) {
    panelProps = {
      ...panelProps,
      checkmate: true,
      winningPlayer: fenComponents.onMove === "w" ? "b" : "w"
    }
  } else if (stalemateFlag) {
    panelProps = {
      ...panelProps,
      stalemate: true
    }
  }

  // STATES
  // Map containing valid moves
  // key is a string, the 'row,col' of the move
  // value is 'm' if its a move, or 'x' if its a capture
  const [validMoves, setValidMoves] = useState(new Map() as validMovesBoardType);
  // the selected piece is highlighted
  const [selectedPiece, setSelectedPiece] = useState(null as coordinateType);
  // state to show promotion pieces
  const [showPromotion, setShowPromotion] = useState(false);
  // promotion coordinates to identify WHERE to show promotable pieces
  const [promotionSquareCoord, setPromotionSquareCoord] = useState(null as coordinateType);
  // STATES END

  // JSX elements of the board
  const boardSquares = prepareBoard();

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
        let currentSquare = `${row},${col}` as coordinateType;
        let hasPiece = positionMap.has(currentSquare);
        let piece: any = hasPiece ? positionMap.get(currentSquare) : "";

        let isValidMove = false;
        // player can only move their own piece
        if (fenComponents.onMove === 'w') {
          if (validMoves.has(currentSquare)) {
            for (let move of validMoveAbbrevs) {
              if (validMoves.get(currentSquare) === move) {
                isValidMove = true;
                break;
              }
            }
          }
        }

        const canCapture =
          validMoves.has(currentSquare) &&
          (
            validMoves.get(currentSquare) === 'x'
            // castling shares the same visual graphic as a capture
            || (validMoves.get(currentSquare) === 'K' && currentSquare === '0,7')
            || (validMoves.get(currentSquare) === 'Q' && currentSquare === '0,0')
            || (validMoves.get(currentSquare) === 'k' && currentSquare === '7,7')
            || (validMoves.get(currentSquare) === 'q' && currentSquare === '7,0')
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
              isSelected={selectedPiece === currentSquare}
              canCapture={canCapture}
              inCheck={checkPosition === currentSquare}
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
        const hasPiece = positionMap.has(currentPosition);
        const piece: any = hasPiece ? positionMap.get(currentPosition) : "";

        let isValidMove = false;
        if (fenComponents.onMove === 'b') {
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

  function castleKing(currentPosition: coordinateType): void {
    const castleDirection = validMoves.get(currentPosition);

    const matches = /(?<white>K?Q?)(?<black>k?q?)/.exec(fenComponents.castle!)!;
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
    fenComponents.halfMoveClock!++;

    // move the king and rook
    // remove the king
    positionMap.delete(selectedPiece);
    const nextPosition = new Map(positionMap);
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
      fenComponents.halfMoveClock!.toString(),
      getFullMoveNumber(FEN)
    );
    // set new FEN to update the board position
    props.sendMove(newFENString);
    clear();
    // setControlledSquares(processor.getControlledSquares(nextPosition));
  }

  function performMove(currentPosition: coordinateType) {
    // handle special case for enpassant
    if (validMoves.get(currentPosition) === 'e') {
      const matches = /(?<rank>[\d]),(?<file>[\d])/.exec(currentPosition!);
      let rank = parseInt(matches?.groups!.rank!);
      const file = parseInt(matches?.groups!.file!);
      rank = fenComponents.onMove === 'w' ? rank - 1 : rank + 1;
      positionMap.delete(`${rank},${file}` as coordinateType);
    }
    const movedPiece: pieceType = positionMap.get(selectedPiece) as pieceType;
    const nextCastlingFEN = newCastlingFENPostRookOrKingMove(fenComponents.castle!, movedPiece, selectedPiece);

    // move the piece
    positionMap.delete(selectedPiece);
    positionMap.set(currentPosition, movedPiece);

    // get the enpassant target square
    const enpassantTargetSquare = getEnPassantTargetSquare(movedPiece, selectedPiece, currentPosition);

    // get the halfmove clock
    const isCapture: boolean = validMoves.get(currentPosition) === 'x';
    fenComponents.halfMoveClock = getHalfMoveClock(fenComponents.halfMoveClock!, movedPiece, isCapture);

    clear();
    // setControlledSquares(processor.getControlledSquares(positionMap));

    // create the new FEN
    const newFENString = componentsToFEN(
      positionMap,
      nextPlayer(FEN),
      nextCastlingFEN,
      enpassantTargetSquare,
      fenComponents.halfMoveClock.toString(),
      getFullMoveNumber(FEN)
    );
    // set new FEN to update the board position
    props.sendMove(newFENString);
  }

  // clear valid moves and selected piece highlight
  function clear() {
    setSelectedPiece(null);
    setValidMoves(new Map());
  }

  /**
   * User clicks on board. There are a few cases
   * 1. Promotion move
   * 2. Castling move
   * 3. Clicking Valid Move moves piece to location
   * 4. Clearing Valid Moves when same piece is clicked twice
   * 5. Showing Valid Moves when valid piece is clicked
   * 6. Resetting Valid Moves when empty square is clicked
   */
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
        piece = fenComponents.onMove === 'w' ? 'Q' : 'q';
      } else if (/Knight/.test(event.target.alt)) {
        piece = fenComponents.onMove === 'w' ? 'N' : 'n';
      } else if (/Rook/.test(event.target.alt)) {
        piece = fenComponents.onMove === 'w' ? 'R' : 'r';
      } else if (/Bishop/.test(event.target.alt)) {
        piece = fenComponents.onMove === 'w' ? 'B' : 'b';
      }

      if (piece !== undefined) {
        const nextPosition = new Map(positionMap);
        const toDelete = promotionSquareCoord!.split(',');

        let pawnRank: number | string = parseInt(toDelete[0]);
        if (fenComponents.onMove === 'w') {
          pawnRank--;
        } else {
          pawnRank++;
        }
        pawnRank = pawnRank.toString();
        toDelete[0] = pawnRank;
        const pawnCoord = toDelete.join();
        nextPosition.delete(pawnCoord as coordinateType);

        nextPosition.set(promotionSquareCoord, piece as pieceType);
        const nextFENString = componentsToFEN(
          nextPosition,
          nextPlayer(FEN),
          fenComponents.castle!,
          '-',
          fenComponents.halfMoveClock!,
          fenComponents.fullMoveNumber!
        );
        clear();
        setShowPromotion(false);
        props.sendMove(nextFENString);
      }
    }
    // valid castling move is clicked
    else if (castle) {
      castleKing(currentPosition);
    }
    // if a valid Move is clicked, move the piece there
    else if (validMoves.has(currentPosition) && props.perspective === fenComponents.onMove) {
      const piece = positionMap.get(selectedPiece);
      const rankMatcher = /(?<rank>[\d]),[\d]/.exec(currentPosition);
      const rank = rankMatcher!.groups!.rank;
      if (
        (piece === 'p' && rank === '0')
        || (piece === 'P' && rank === '7')
      ) {
        // move is a pawn promotion
        setShowPromotion(true);
        setPromotionSquareCoord(currentPosition);
        return;
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
    else if (positionMap.has(currentPosition) &&
      // its white's turn and a white piece is clicked OR
      // its black's turn and a black piece is clicked
      (
        (fenComponents.onMove === 'w' && isWhitePiece(positionMap.get(currentPosition)))
        || (fenComponents.onMove === 'b' && isBlackPiece(positionMap.get(currentPosition)))
      ) &&
      (props.perspective === fenComponents.onMove)
    ) {
      let naiveValidMoves = handleFindValidMoves(
        event.target,
        currentPosition,
        positionMap,
        fenComponents.onMove === 'w' ? controlledSquares.black : controlledSquares.white,
        FEN,
        checkPosition
      );
      // for each valid move
      // simulate this move to check if it is truly vaild
      const validMoves = processor.simulateMove(naiveValidMoves, currentPosition);

      setValidMoves(validMoves);
      // change background color to indicate piece is selected
      setSelectedPiece(currentPosition)
    }
    // reset if an empty square is clicked
    else {
      clear();
    }
  }

  return (
    <div>
      {DEBUG && <h1>{processor.fen}</h1>}
      <div
        onClick={handleClick}
        className={boardstyles['promotion-parent']}
      >
        {showPromotion && <Promotion
          player={fenComponents.onMove as playerType}
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
          stalemate={panelProps.stalemate}
        />
      </div>
    </div>
  );
}
