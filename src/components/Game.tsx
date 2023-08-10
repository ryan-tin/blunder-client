import { playerType } from "@/types/Types";
import Board from "./Board";

interface GameProps {
  perspective: playerType;
}

export default function Game({ perspective }: GameProps) {
  // const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  // const startingFEN = 'r3k2r/6b1/8/8/8/8/P7/R3K2R w KQkq - 0 1'; // debug castling
  // const startingFEN = '8/q7/8/8/8/8/8/8 w KQkq - 0 1'; // empty board
  // const startingFEN = '4k3/q7/8/8/8/8/Q7/4K3 w KQkq - 0 1';
  // const startingFEN = 'k7/8/8/1p4P1/8/8/8/7K w KQkq - 0 1';
  // const startingFEN = '1k6/1pp5/8/Qn6/N7/8/8/R5K1 w - - 0 1'; // double check and checkmate test
  // const startingFEN = '6rk/6pp/8/8/8/8/2B4Q/7K w - - 0 1'; // checkmate for white
  // const startingFEN = '4k3/pppppppp/8/8/8/8/PPPPPPPP/K7 w KQkq - 0 1'; // en passant
  // const startingFEN = '7r/8/8/8/7q/8/5PP1/6K1 b - - 0 1'; // black chekmate
  // const startingFEN = 'rnbqkbnr/8/8/8/8/8/8/RNBQK2R b KQkq - 0 1'; // castling through check
  const startingFEN = '4k2r/5Pb1/8/8/8/8/P7/R3K2R w KQkq - 0 1'; // white promotion
  // const startingFEN = '4k2r/5pb1/8/8/8/8/p7/13K2R b KQkq - 0 1'; // black promotion

  return (
    <div>
      <Board
        startingPosition={startingFEN}
        perspective={perspective}
      />
    </div>
  );
}

