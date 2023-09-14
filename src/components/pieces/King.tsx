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

  return <Image
    draggable={props.draggable}
    src={kingAttributes.src}
    alt={kingAttributes.alt}
    height={100}
    width={100}
    className={styles.Piece}
    id={props.coordinates as string}
    data-row={props["data-row"]}
    data-col={props["data-col"]}
    priority={true}
  />;
}
