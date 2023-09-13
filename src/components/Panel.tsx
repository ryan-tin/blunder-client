import { playerType } from "../types/Types";
import styles from '@/styles/App.module.css';

export interface PanelProps {
  checkmate: boolean;
  stalemate: boolean;
  winningPlayer: playerType;
}

export default function Panel({ 
  checkmate, winningPlayer, stalemate }: PanelProps) {
  let message = '';
  if (checkmate) {
    message = `Checkmate.`;
    message = winningPlayer === 'w' ? message + ' White wins.' : message + ' Black wins.';
  }
  if (stalemate) {
    message = 'Stalemate. Draw.';
  }

  return (
    <div className={styles.checkmate}>
      <h1>{message}</h1>
    </div>
  );
}
