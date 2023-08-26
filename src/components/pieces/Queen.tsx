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

  function handleClick(e: any) {
    // do nothing
    // rely on event popagation
  }

  return <Image
    src={queenAttributes.src}
    alt={queenAttributes.alt}
    height={100}
    width={100}
    className={styles.Piece}
    id={props.coordinates as string}
    onClick={handleClick}
    priority={true}
  />;
}

