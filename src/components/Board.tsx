'use client'

import { useRef, useState } from 'react';
import Square from './Square';
import Piece from './pieces//Piece';
import Promotion from './Promotion';
import {
  boardType,
  coordinateType,
  pieceType,
  playerType,
  validMovesBoardType,
  fenComponents,
  controlledSquares,
  lastMove
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
  nextPlayer
} from '@/utils/fen';
import boardstyles from '@/styles/Board.module.css';
import squarestyles from '@/styles/Board.module.css';
import { Processor } from '@/utils/Processor';
import { getCoordFromCoordType } from '@/utils/regex';
import CoordinateSquare from './CoordinateSquare';
import { coordToChessNotation, pieceToChessNotation } from '@/utils/notation';

interface boardProps {
  FEN: string;
  perspective: playerType;
  sendMove: Function;
  lastMove: lastMove;
  gameOverFlag: boolean;
  gameEnd: Function;
  inHistory: boolean;
  appendNotation: Function
}

const DEBUG = false;

export default function Board(props: boardProps) {
  const processor = Processor.Instance;
  const FEN = props.FEN;
  const lastMove = props.lastMove;

  let positionMap: boardType;
  let checkPosition: coordinateType;
  if (props.inHistory) {
    // compute necessary values for history
    processor.h_FEN = props.FEN;
    processor.H_RELOAD();
    positionMap = processor.h_positionMap as boardType;
    checkPosition = processor.h_kingCheckedPosition;
  } else {
    // FEN changes when opponent sends it through the websocket
    // recompute values every time the FEN changes
    positionMap = processor.positionMap as boardType;
    checkPosition = processor.kingCheckedPosition as coordinateType;
  }

  const fenComponents: fenComponents = processor.fenComponents;
  const controlledSquares: controlledSquares =
    processor.controlledSquares as controlledSquares;

  // game termination panel: stalemate & checkmate
  const checkmateFlag: boolean = processor.checkmate;
  const stalemateFlag: boolean = processor.stalemate;

  if (checkmateFlag || stalemateFlag) {
    props.gameEnd(checkmateFlag, stalemateFlag, fenComponents.onMove === "w" ? "b" : "w");
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

  // REF does not trigger re-render
  const hoverOverCoord = useRef(null); // coordinate
  // REF END

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
        const piece: any = hasPiece ? positionMap.get(currentSquare) : "";

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
            draggable={isWhitePiece(piece) ? true : false}
            data-row={row}
            data-col={col}
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
              lastMove={lastMove}
            >
              {child}
            </Square>
          </span >
        );

        if (col == 0) {
          boardRow.push(
            <CoordinateSquare vertical={true}>
              <p>{row + 1}</p>
            </CoordinateSquare>
          )
        }
      }

      boardSquares.push(
        <div key={row} className={boardstyles["Board-row-container"]}>
          {boardRow}
        </div>
      )
    }

    let horizontalCoordinates = [];
    for (let i = 0; i <= 7; i++) {
      horizontalCoordinates.push(
        <CoordinateSquare vertical={false}>
          <p>{String.fromCharCode('a'.charCodeAt(0) + i)}</p>
        </CoordinateSquare>
      );
    }
    horizontalCoordinates.push(
      <span style={{
        height: '1vmax',
        width: '1vmax'
      }}>
      </span>
    )

    boardSquares.push(
      <div className={boardstyles["Board-row-container"]}>
        {horizontalCoordinates}
      </div>
    );
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
            draggable={isBlackPiece(piece) ? true : false}
            coordinates={`${row},${col}` as coordinateType}
            data-row={row}
            data-col={col}
          />;

        boardRow.unshift(
          <span key={value} >
            <Square
              key={value} value={value} row={row} col={col}
              isValidMove={isValidMove}
              isSelected={selectedPiece === currentPosition}
              canCapture={canCapture}
              inCheck={checkPosition === currentPosition}
              lastMove={lastMove}
            >
              {child}
            </Square>
          </span>
        );

        if (col == 0) {
          boardRow.push(
            <CoordinateSquare vertical={true}>
              <p>{row + 1}</p>
            </CoordinateSquare>
          )
        }
      }

      boardSquares.push(
        <div key={row} className={boardstyles["Board-row-container"]}>
          {boardRow}
        </div>
      )
    }

    let horizontalCoordinates = [];
    for (let i = 0; i <= 7; i++) {
      horizontalCoordinates.push(
        <CoordinateSquare vertical={false}>
          <p>{String.fromCharCode('h'.charCodeAt(0) - i)}</p>
        </CoordinateSquare>
      );
    }
    horizontalCoordinates.push(
      <span style={{
        height: '1vmax',
        width: '1vmax'
      }}>
      </span>
    )

    boardSquares.push(
      <div className={boardstyles["Board-row-container"]}>
        {horizontalCoordinates}
      </div>
    );
    return boardSquares;
  }

  function castleKing(currentPosition: coordinateType): void {
    // currentPosition is the place clicked
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
    let lastMove = { from: selectedPiece, to: null } as lastMove;
    let moveNotation: string | null = null;
    switch (castleDirection) {
      case 'K':
        nextPosition.delete('0,7'); // remove the rook
        nextPosition.set('0,6', 'K');
        nextPosition.set('0,5', 'R');
        lastMove.to = '0,7';
        moveNotation = "O-O"
        break;
      case 'Q':
        nextPosition.delete('0,0'); // remove the rook
        nextPosition.set('0,2', 'K');
        nextPosition.set('0,3', 'R');
        lastMove.to = '0,0';
        moveNotation = "O-O-O"
        break;
      case 'k':
        nextPosition.delete('7,7'); // remove the rook
        nextPosition.set('7,6', 'k');
        nextPosition.set('7,5', 'r');
        lastMove.to = '7,7';
        moveNotation = "O-O"
        break;
      case 'q':
        nextPosition.delete('7,0'); // remove the rook
        nextPosition.set('7,2', 'k');
        nextPosition.set('7,3', 'r');
        lastMove.to = '7,0';
        moveNotation = "O-O-O"
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
    props.sendMove(newFENString, lastMove, moveNotation);
    clear();
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

    // find chess notation for history
    let chessNotation = pieceToChessNotation(movedPiece);

    // move the piece
    positionMap.delete(selectedPiece);
    // check if there is a piece in the destination
    const pieceCaptured = positionMap.has(currentPosition);
    positionMap.set(currentPosition, movedPiece);

    if (pieceCaptured) {
      chessNotation += 'x' + coordToChessNotation(currentPosition);
    } else {
      chessNotation += coordToChessNotation(currentPosition);
    }

    const lastMove = { from: selectedPiece, to: currentPosition };

    // get the enpassant target square
    const enpassantTargetSquare = getEnPassantTargetSquare(movedPiece, selectedPiece, currentPosition);

    // get the halfmove clock
    const isCapture: boolean = validMoves.get(currentPosition) === 'x';
    fenComponents.halfMoveClock = getHalfMoveClock(fenComponents.halfMoveClock!, movedPiece, isCapture);

    clear();

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
    props.sendMove(newFENString, lastMove, chessNotation);
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
    // no moves can be made if a player has run out of time
    if (props.gameOverFlag || props.inHistory) {
      return;
    }
    let currentPosition = event.target.id;
    let isSelectPromotionPiece = event.target.offsetParent.className.includes('promotion');

    const castlingMoves = ['K', 'Q', 'k', 'q'];
    let castle = false;
    for (let move of castlingMoves) {
      if (validMoves.get(currentPosition) === move) {
        castle = true;
        break;
      }
    }

    // promotion move
    if (isSelectPromotionPiece) {
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
        let lastMove: lastMove = { from: null, to: promotionSquareCoord };
        let temp = getCoordFromCoordType(promotionSquareCoord);
        if (fenComponents.onMove === 'w') {
          lastMove.from = `${(parseInt(temp.rank) - 1).toString()},${temp.file}` as coordinateType;
        } else {
          lastMove.from = `${(parseInt(temp.rank) + 1).toString()},${temp.file}` as coordinateType;
        }
        let chessNotation = coordToChessNotation(promotionSquareCoord) + "=" + piece.toUpperCase()
        props.sendMove(nextFENString, lastMove, chessNotation);
      }
    }
    // valid castling move is clicked
    else if (castle) {
      castleKing(currentPosition);
    }
    // if a valid Move is clicked, move the piece there
    else if (validMoves.has(currentPosition) && props.perspective === fenComponents.onMove) {
      const piece = positionMap.get(selectedPiece);
      const rank = event.target.dataset.row
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

  /**
   * triggers when a piece is picked up
   */
  function handleDragStart(event: any) {
    event.dataTransfer.effectAllowed = "move";
    // no moves can be made if a player has run out of time
    if (props.gameOverFlag || props.inHistory) {
      return;
    }
    let currentPosition = event.target.id;
    if (positionMap.has(currentPosition) &&
      // its white's turn and a white piece is clicked OR
      // its black's turn and a black piece is clicked
      (
        (fenComponents.onMove === 'w' && isWhitePiece(positionMap.get(currentPosition)))
        || (fenComponents.onMove === 'b' && isBlackPiece(positionMap.get(currentPosition)))
      ) &&
      (props.perspective === fenComponents.onMove)
    ) {
      // compute & show valid moves
      const currentPosition = event.target.id
      let naiveValidMoves = handleFindValidMoves(
        event.target,
        currentPosition,
        positionMap,
        fenComponents.onMove === 'w' ? controlledSquares.black : controlledSquares.white,
        FEN,
        checkPosition
      );
      const validMoves = processor.simulateMove(naiveValidMoves, currentPosition);
      setValidMoves(validMoves);
      setSelectedPiece(event.target.id);
    }
  }

  /**
   * triggers when a piece is dropped
   */
  function handleDrop(event: any) {
    const castlingMoves = ['K', 'Q', 'k', 'q'];
    let castle = false;
    for (let move of castlingMoves) {
      if (validMoves.get(hoverOverCoord.current) === move) {
        castle = true;
        break;
      }
    }

    // castling
    if (castle) {
      castleKing(hoverOverCoord.current);
    }
    // selecting promotion piece does not need to be handled
    // normal move (incl. drag pawn to promotion rank)
    else if (validMoves.has(hoverOverCoord.current) && props.perspective === fenComponents.onMove) {
      const piece = positionMap.get(selectedPiece);
      const dropRank = getCoordFromCoordType(hoverOverCoord.current).rank;
      if (
        (piece === 'p' && dropRank == '0')
        || (piece === 'P' && dropRank == '7')
      ) {
        // move is a pawn promotion
        setShowPromotion(true);
        setPromotionSquareCoord(hoverOverCoord.current);
        return;
      } else {
        setShowPromotion(false);
        setPromotionSquareCoord(null);
      }
      performMove(hoverOverCoord.current);
    }
  }

  /**
   * triggers when piece is dragged over
   * change the background of a square if it is a valid move
   */
  function handleDragEnter(event: any) {
    hoverOverCoord.current = event.target.id
    if (validMoves.has(hoverOverCoord.current)) {
      event.target.classList.remove(squarestyles['light-square']);
      event.target.classList.remove(squarestyles['dark-square']);
      event.target.classList.remove(squarestyles['transparent']);
      event.target.classList.add(squarestyles['drag-over']);
      event.stopPropagation();
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
        onDragStart={handleDragStart}
        onDragEnd={handleDrop}
        onDragEnter={handleDragEnter}
      >
        {boardSquares}
      </div>
    </div>
  );
}
