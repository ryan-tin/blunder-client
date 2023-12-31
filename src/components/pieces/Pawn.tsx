'use client'

import styles from '@/styles/Piece.module.css';
import Image from 'next/image';
import { pieceProps } from './Piece';

export default function Pawn(props: pieceProps) {
  let pawnAttributes;

  if (props.player === "w") {
    pawnAttributes = {
      src: '/assets/cburnett/wP.svg',
      alt: "White Pawn"
    };
  } else {
    pawnAttributes = {
      src: '/assets/cburnett/bP.svg',
      alt: "Black Pawn"
    };
  }

  return <Image
    draggable={props.draggable}
    src={pawnAttributes.src}
    alt={pawnAttributes.alt}
    height={100}
    width={100}
    className={styles.Piece}
    id={props.coordinates as string}
    data-row={props["data-row"]}
    data-col={props["data-col"]}
    priority={true}
  />;
}
