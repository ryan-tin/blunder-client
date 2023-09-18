import { playerType } from "../types/Types";
import styles from '@/styles/App.module.css';

export interface PanelProps {
  checkmate: boolean;
  stalemate: boolean;
  winningPlayer: playerType;
  timeOut: {
    isTimeOver: boolean,
    winner: playerType
  }
}

export default function Panel({
  checkmate, winningPlayer, stalemate, timeOut }: PanelProps) {

  let message = '';

  if (checkmate) {
    message = `Checkmate.`;
    message = winningPlayer === 'w' ? message + ' White is victorious.' : message + ' Black is victorious.';
  }

  if (stalemate) {
    message = 'Stalemate. Draw.';
  }

  if (timeOut.isTimeOver) {
    if (timeOut.winner === 'w') {
      message = 'Black ran out of time. White is victorious.'
    } else {
      message = 'White ran out of time. Black is victorious.'
    }
  }

  return (
    <div className={styles.checkmate}>
      <h1>{message}</h1>
    </div>
  );
}
