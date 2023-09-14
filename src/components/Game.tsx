'use client'

import { playerType, lastMove } from "@/types/Types";
import Board from "@/components/Board";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { Processor } from '@/utils/Processor';

interface GameProps {
  perspective: playerType;
  roomId: string;
}

export default function Game({ perspective, roomId }: GameProps) {
  const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const [FEN, setFEN] = useState(startingFEN);
  const [socket, setSocket] = useState(io(`http://localhost:60001/game`));
  const [lastMove, setLastMove] = useState({ from: null, to: null } as lastMove)
  const processor = Processor.Instance;

  useEffect(() => {
    socket.on('connect', () => {
      console.log(`connected to socket ${socket.id}`);
    })

    socket.emit('join room', roomId);

    // listen for opponent moves
    socket.on('send move', (message: any) => {
      // opponent sent FEN, update board
      setFEN(message.FEN);
      setLastMove(message.lastMove);
      processor.FEN = message.FEN;
    })

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    })

    return () => {
      socket.close();
    }
  }, []);

  // send move to opponent
  function handleSendNextMove(newFEN: string, lastMove: lastMove) {
    let message = {
      roomId: roomId,
      FEN: newFEN,
      lastMove: lastMove
    }
    // send FEN to opponent
    socket.emit('send move', message);
    // update own board
    setFEN(newFEN);
    setLastMove(lastMove);
    processor.FEN = newFEN;
  }

  return (
    <div>
      <Board
        FEN={FEN}
        lastMove={lastMove}
        perspective={perspective}
        sendMove={handleSendNextMove}
      />
    </div>
  );
}

