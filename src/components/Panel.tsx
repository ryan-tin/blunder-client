import { playerType } from "../types/Types";
import styles from "@/styles/Game.module.css"

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
  let message;

  if (checkmate) {
    message = `Checkmate. ${winningPlayer === 'w' ? 'White' : 'Black'} is victorious.`
  }

  if (stalemate) {
    message = 'Stalemate. Draw'
  }

  if (timeOut.isTimeOver) {
    if (timeOut.winner === 'w') {
      message = "Black time out. White is victorious.";
    } else {
      message = "White time out. Black is victorious.";
    }
  }

  return (
    <div className={styles['panel-parent-container']}>
      <p className={styles['panel-font']}>
        {message}
      </p>
    </div>
  );
}
