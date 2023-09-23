import { historyEntry } from "@/types/Types";
import styles from "@/styles/History.module.css";

interface historyProps {
  moveHistory: historyEntry[];
  historyIndex: number;
}

export default function History(props: historyProps) {

  return (
    <div>
      <h1>Move History</h1>
      <ol>
        {props.moveHistory.map((element: historyEntry, index: number, list: historyEntry[]) => {
          if (index === 0 || index % 2 === 0) {
            // don't show starting position as a state
            // and black moves are shown on the same line as white moves
            return;
          }
          let whiteMove = element.chessNotation;
          let blackMove = index + 1 <= list.length - 1 ? list[index + 1].chessNotation : ""

          return (
            <li key={index}
              style={{
                margin: '0',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                }}
              >
                <p className={props.historyIndex === index ? styles['current-history-state'] : ""}>
                  {whiteMove}
                </p>
                <p className={props.historyIndex === index + 1 ? styles['current-history-state'] : ""}>
                  {blackMove}
                </p>
              </span>
            </li>
          );
        })}
      </ol>
    </div >
  );
}
