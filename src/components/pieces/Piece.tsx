'use client'
import Pawn from './Pawn';
import King from './King';
import Queen from './Queen';
import Bishop from './Bishop';
import Knight from './Knight';
import Rook from './Rook';
import { pieceType, playerType, coordinateType } from '../../types/Types';

export interface pieceProps {
  player?: playerType;
  pieceType: pieceType;
  isPinned?: boolean;
  coordinates: coordinateType;
};

export default function Piece(props: pieceProps) {
  let piece = null;
  switch (props.pieceType) {
    // black pieces
    case 'p':
      piece = <Pawn {...props} player='b' />;
      break;
    case 'k':
      piece = <King {...props} player='b' />
      break;
    case 'q':
      piece = <Queen {...props} player='b' />
      break;
    case 'b':
      piece = <Bishop {...props} player='b' />
      break;
    case 'n':
      piece = <Knight {...props} player='b' />
      break;
    case 'r':
      piece = <Rook {...props} player='b' />
      break;
    case 'P':
      piece = <Pawn {...props} player='w'/>;
      break;
    case 'K':
      piece = <King {...props} player='w'/>
      break;
    case 'Q':
      piece = <Queen {...props} player='w'/>
      break;
    case 'B':
      piece = <Bishop {...props} player='w'/>
      break;
    case 'N':
      piece = <Knight {...props} player='w' />
      break;
    case 'R':
      piece = <Rook {...props} player='w' />
      break;
  }

  return piece;
}
