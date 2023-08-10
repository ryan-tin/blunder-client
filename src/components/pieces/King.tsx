'use client'

import styles from '@/styles/Piece.module.css';
import Image from "next/image";
import { pieceProps } from "./Piece";

export default function King(props: pieceProps) {
  let kingAttributes;

  if (props.player === "w") {
    kingAttributes = {
      src: '/assets/cburnett/wK.svg',
      alt: "White King"
    };
  } else {
    kingAttributes = {
      src: '/assets/cburnett/bK.svg',
      alt: "Black King"
    };
  }

  function handleClick(e: any) {
    // do nothing
    // rely on event popagation
  }

  return <Image
    src={kingAttributes.src}
    alt={kingAttributes.alt}
    height={100}
    width={100}
    className={styles.Piece}
    id={props.coordinates as string}
    onClick={handleClick}
  />;
}
