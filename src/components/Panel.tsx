import { playerType } from "../types/Types";
import styles from '@/styles/App.module.css';

export interface PanelProps {
  checkmate: boolean;
  winningPlayer: playerType;
}

export default function Panel({ checkmate, winningPlayer }: PanelProps) {
  let message = '';
  if (checkmate) {
    message = `Checkmate.`;
    message = winningPlayer === 'w' ? message + ' White wins.' : message + ' Black wins.';
  }

  return (
    <div className={styles.checkmate}>
      <h1>{message}</h1>
    </div>
  );
}
