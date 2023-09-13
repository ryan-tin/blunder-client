'use client'

import React, { ReactElement } from 'react';
import squarestyles from '@/styles/Board.module.css';

interface SquareProps {
  key: number;
  value: number;
  row: number;
  col: number;
  isValidMove: boolean;
  isSelected: boolean; // whether this square contains a clicked piece
  canCapture: boolean; // whether this square contains an enemy piece that can be captured
  inCheck: boolean;
  controlled?: boolean; // whether this suqare is being attacked by a piece
  children: ReactElement;
}

export default function Square(props: SquareProps) {
  const darkSquare: React.CSSProperties = {
    backgroundColor: 'rgb(144, 161, 172)' // nordic blue
  }
  const lightSquare: React.CSSProperties = {
    backgroundColor: 'rgb(223, 227, 230)' // icy white
  }
  const selectedSquare: React.CSSProperties = {
    // backgroundColor: 'rgb(92,122,105)' // lichess green
    backgroundColor: 'rgb(207, 139, 94)' // kanagawa orange
  }
  // const checkedKing: React.CSSProperties = {
  //   // backgroundColor: 'rgb(92,122,105)' // lichess green
  //   backgroundColor: "red"
  // }
  const controlledStyle: React.CSSProperties = {
    backgroundColor: "firebrick"
  }
  

  // determine whether square is a light or dark square
  let styles = (props.row + props.col) % 2 === 0 ? darkSquare : lightSquare;

  // styles = props.controlled ? controlledStyle : styles;
  // styles = props.inCheck ? checkedKing : styles;

  let className = `${squarestyles.square}`; 
  className = props.isValidMove ? className += " " + squarestyles['move-dest'] : className;
  className = props.canCapture ? className += " " + squarestyles['capture'] : className;
  className = props.inCheck ? className += " " + squarestyles['check'] : className;

  // do not remove, empty on purpose
  // propagates up to Board
  function handleClick(event: any) {}

  const id=`${props.row},${props.col}`;

  return (
    <span
      className={className}
      id={id}
      style={props.isSelected ? selectedSquare : styles}
      onClick={handleClick}
    >
      {/* `${props.value}, ` */}
      {/* `${props.row},${props.col}` */}
      {props.children}
    </span>
  );
}

