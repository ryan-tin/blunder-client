'use client'
import Piece from "./pieces/Piece";
import { boardType, coordinateType, playerType } from "@/types/Types";
import styles from '@/styles/Board.module.css';

interface PromotionProps {
  player: playerType;
  child?: React.ReactNode;
  promotionSquareCoord: coordinateType;
}

export default function Promotion(props: PromotionProps) {
  let position = new Map() as boardType;

  let promotionComponents;
  let promotionRank;
  let promotionFile;

  if (props.promotionSquareCoord !== null) {
    promotionComponents = props.promotionSquareCoord.split(',');
    promotionRank = promotionComponents[0];
    promotionFile = promotionComponents[1];
    position.set(`${parseInt(promotionRank)},${promotionFile}` as coordinateType, 'Q');
    position.set(`${parseInt(promotionRank) - 1},${promotionFile}` as coordinateType, 'N');
    position.set(`${parseInt(promotionRank) - 2},${promotionFile}` as coordinateType, 'R');
    position.set(`${parseInt(promotionRank) - 3},${promotionFile}` as coordinateType, 'B');
  }

  const boardSquares = renderPromotionBoard();

  function handleClick(event: any) {
    // do not remove, empty for event propagation to Board
  }

  function renderPromotionBoard() {
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
      }
      boardSquares.push(
        <div key={row} className={styles['Board-row-container']}> {boardRow} </div>
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
