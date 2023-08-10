'use client'

import styles from '@/styles/Piece.module.css';
import Image from "next/image";
import { pieceProps } from "./Piece";

export default function Rook(props: pieceProps) {
  let rookAttributes;

  if (props.player === "w") {
    rookAttributes = {
      src: '/assets/cburnett/wR.svg',
      alt: "White Rook"
    };
  } else {
    rookAttributes = {
      src: '/assets/cburnett/bR.svg',
      alt: "Black Rook"
    };
  }

  function handleClick(e: any) {
    // do nothing
    // rely on event popagation
  }

  return <Image
    src={rookAttributes.src}
    alt={rookAttributes.alt}
    height={100}
    width={100}
    className={styles.Piece}
    id={props.coordinates as string}
    onClick={handleClick}
  />;
}
