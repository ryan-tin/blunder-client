import { ReactElement } from "react";
import squarestyles from '@/styles/Board.module.css';

interface CoordinateSquareProps {
  children: ReactElement;
  vertical: boolean;
}

export default function CoordinateSquare(props: CoordinateSquareProps) {
  let className = props.vertical ?
    squarestyles['square-coordinate-vertical'] : squarestyles['square-coordinate-horizontal']
  return (
    <span className={className}>
      {props.children}
    </span>
  );
}
