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
  let className = `${squarestyles.square}`;

  // UGLY
  className = (props.row + props.col) % 2 === 0 ?
    className += " " + squarestyles['dark-square'] :
    className += " " + squarestyles['light-square'];

  className = props.isValidMove ?
    className += " " + squarestyles['move-dest'] : className;

  className = props.canCapture ?
    className += " " + squarestyles['capture'] : className;

  className = props.inCheck ?
    className += " " + squarestyles['check'] : className;

  className = props.isSelected ?
    className += " " + squarestyles['selected-square'] : className;

  const id = `${props.row},${props.col}`;

  /**
   * reset background color of square to show piece leaving square
   */
  function handleDragLeave(event: any) {
    event.target.classList.remove(squarestyles['drag-over']);
    // console.log(row, col);
    resetBackground(event)
    event.stopPropagation();
  }

  /**
   * necessary to guarantee no default drop behavior
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/drop_event
   */
  function handleDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * drop piece at location if it can go there
   */
  function handleDrop(event: any) {
    resetBackground(event);
  }

  /**
   * reset background
   */
  function resetBackground(event: any): void {
    const row = parseInt(event.target.dataset['row'])
    const col = parseInt(event.target.dataset['col'])
    // HACK: the following condition is true when there is a piece in a square
    if (props.children.props.pieceType !== "") {
      // square with a piece in it has a transparent background
      event.target.classList.add(squarestyles['transparent']);
    } else if ((row + col) % 2 === 0) {
      event.target.classList.add(squarestyles['dark-square']);
    } else {
      event.target.classList.add(squarestyles['light-square']);
    }
  } 

  return (
    <span
      className={className}
      id={id}
      // define custom attributes by prefacing it with 'data-'
      data-row={props.row}
      data-col={props.col}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* `${props.value}, ` */}
      {/* `${props.row},${props.col}` */}
      {props.children}
    </span>
  );
}

