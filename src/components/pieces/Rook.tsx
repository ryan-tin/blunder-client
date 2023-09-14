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

  return <Image
    draggable={props.draggable}
    src={rookAttributes.src}
    alt={rookAttributes.alt}
    height={100}
    width={100}
    className={styles.Piece}
    id={props.coordinates as string}
    data-row={props["data-row"]}
    data-col={props["data-col"]}
    priority={true}
  />;
}
