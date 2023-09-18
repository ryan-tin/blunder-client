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
    message = (
      <p>Checkmate.<br />{winningPlayer === 'w' ? 'White is victorious.' : ' Black is victorious.'}</p>
    );
  }

  if (stalemate) {
    message = <p>Stalemate.<br />Draw.</p>;
  }

  if (timeOut.isTimeOver) {
    if (timeOut.winner === 'w') {
      message = <p>Black time out.<br />White is victorious.</p>;
    } else {
      message = <p>White time out.<br />Black is victorious.</p>;
    }
  }

  return (
    <div className={styles['panel-parent-container']}>
      {message}
    </div>
  );
}
