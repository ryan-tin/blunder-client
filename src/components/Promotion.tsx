'use client'
import Piece from "./pieces/Piece";
import { boardType, coordinateType, playerType } from "@/types/Types";
import styles from '@/styles/Board.module.css';
import CoordinateSquare from "./CoordinateSquare";
import boardstyles from '@/styles/Board.module.css';

interface PromotionProps {
  player: playerType;
  child?: React.ReactNode;
  promotionSquareCoord: coordinateType;
}

export default function Promotion(props: PromotionProps) {
  let position = new Map() as boardType;
  let promotionRank;
  let promotionFile;

  if (props.promotionSquareCoord !== null) {
    const promotionComponents = props.promotionSquareCoord.split(',');
    promotionRank = promotionComponents[0];
    promotionFile = promotionComponents[1];
    if (props.player === 'w') {
      position.set(`${parseInt(promotionRank)},${promotionFile}` as coordinateType, 'Q');
      position.set(`${parseInt(promotionRank) - 1},${promotionFile}` as coordinateType, 'N');
      position.set(`${parseInt(promotionRank) - 2},${promotionFile}` as coordinateType, 'R');
      position.set(`${parseInt(promotionRank) - 3},${promotionFile}` as coordinateType, 'B');
    } else {
      position.set(`${parseInt(promotionRank)},${promotionFile}` as coordinateType, 'q');
      position.set(`${parseInt(promotionRank) + 1},${promotionFile}` as coordinateType, 'n');
      position.set(`${parseInt(promotionRank) + 2},${promotionFile}` as coordinateType, 'r');
      position.set(`${parseInt(promotionRank) + 3},${promotionFile}` as coordinateType, 'b');
    }
  }

  const boardSquares = renderPromotionBoard();

  function handleClick(event: any) {
    // do not remove, empty for event propagation to Board
  }

  function renderPromotionBoard() {
    let boardSquares;
    if (props.player === 'w') {
      boardSquares = renderWhitePromotionBoard();
    } else {
      boardSquares = renderBlackPromotionBoard();
    }
    return boardSquares;
  }

  function renderWhitePromotionBoard() {
    let boardSquares = [];

    for (let row = 7; row >= 0; row--) {
      let boardRow = [];
      for (let col = 7; col >= 0; col--) {
        let currentPosition = `${row},${col}` as coordinateType;
        let hasPiece = position.has(currentPosition);
        let piece: any = hasPiece ? position.get(currentPosition) : "";

        let value = (row * 8) + col;
        let child = (
          <Piece
            draggable={false}
            pieceType={piece}
            coordinates={`${row},${col}` as coordinateType}
          />
        )
        boardRow.unshift(
          <span
            key={value}
            className={styles.square}
            id='empty'
            onClick={handleClick}
          >
            {child}
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
        <div key={row} className={styles['Board-row-container']}> {boardRow} </div>
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

  function renderBlackPromotionBoard() {
    let boardSquares = [];

    for (let row = 0; row <= 7; row++) {
      let boardRow = [];
      for (let col = 7; col >= 0; col--) {
        let currentPosition = `${row},${col}` as coordinateType;
        let hasPiece = position.has(currentPosition);
        let piece: any = hasPiece ? position.get(currentPosition) : "";

        let value = (row * 8) + col;
        let child = (
          <Piece
            draggable={false}
            pieceType={piece}
            coordinates={`${row},${col}` as coordinateType}
          />
        )
        boardRow.push(
          <span
            key={value}
            className={styles.square}
            id='empty'
            onClick={handleClick}
          >
            {child}
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
        <div key={row} className={styles['Board-row-container']}> {boardRow} </div>
      )

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

    }
    return boardSquares;

  }

  return (
    <div className={styles.promotion} onClick={handleClick}>
      {boardSquares}
    </div>
  )
}
