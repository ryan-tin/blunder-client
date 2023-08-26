'use client'

import styles from '@/styles/Piece.module.css';
import Image from 'next/image';
import { pieceProps } from "./Piece";

export default function Knight(props: pieceProps) {
  let knightAttributes;

  if (props.player === "w") {
    knightAttributes = {
      src: '/assets/cburnett/wN.svg',
      alt: "White Knight"
    };
  } else {
    knightAttributes = {
      src: '/assets/cburnett/bN.svg',
      alt: "Black Knight"
    };
  }

  function handleClick(e: any) {
    // do nothing
    // rely on event popagation
  }

  return <Image
    src={knightAttributes.src}
    alt={knightAttributes.alt}
    height={100}
    width={100}
    className={styles.Piece}
    id={props.coordinates as string}
    onClick={handleClick}
    priority={true}
  />

}
