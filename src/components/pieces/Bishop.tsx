'use client'

import styles from '@/styles/Piece.module.css';
import Image from 'next/image';
import { pieceProps } from "./Piece";

export default function Bishop(props: pieceProps) {
  let bishopAttributes;

  if (props.player === "w") {
    bishopAttributes = {
      src: '/assets/cburnett/wB.svg',
      alt: "White Bishop"
    };
  } else {
    bishopAttributes = {
      src: '/assets/cburnett/bB.svg',
      alt: "Black Bishop"
    };
  }

  function handleClick() {
    // rely on event propagation
  }

  return <Image
    src={bishopAttributes.src}
    alt={bishopAttributes.alt}
    height={100}
    width={100}
    className={styles.Piece}
    id={props.coordinates as string}
    onClick={handleClick}
  />;
}
