'use client'

import Image from "next/image";
import { pieceProps } from "./Piece";
import styles from '@/styles/Piece.module.css';

export default function Queen(props: pieceProps) {
  let queenAttributes;

  if (props.player === "w") {
    queenAttributes = {
      src: '/assets/cburnett/wQ.svg',
      alt: "White Queen"
    };
  } else {
    queenAttributes = {
      src: '/assets/cburnett/bQ.svg',
      alt: "Black Queen"
    };
  }

  return <Image
    draggable={props.draggable}
    src={queenAttributes.src}
    alt={queenAttributes.alt}
    height={100}
    width={100}
    className={styles.Piece}
    id={props.coordinates as string}
    data-row={props["data-row"]}
    data-col={props["data-col"]}
    priority={true}
  />;
}

