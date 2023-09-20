import { historyEntry } from "@/types/Types";

interface historyProps {
  moveHistory: historyEntry[];
}

export default function History(props: historyProps) {

  return (
    <div>
      <h1>Move History</h1>
      <ol>
        {props.moveHistory.map((element: historyEntry, index: number, list: historyEntry[]) => {
          if (index === 0 || index % 2 === 0 ) {
            return;
          }
          let whiteMove = element.chessNotation;
          let blackMove = index + 1 <= list.length - 1 ? list[index + 1].chessNotation : ""

          return (
            <li key={index}
              style={{
                margin: '10px 0'
              }}
            >
              <span
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                }}
              >
                <p>
                  {whiteMove}
                </p>
                <p>
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
