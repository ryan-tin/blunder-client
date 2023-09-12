'use client'

import { playerType } from "@/types/Types";
import Board from "./Board";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

interface GameProps {
  perspective: playerType;
  roomId: string;
}

export default function Game({ perspective, roomId }: GameProps) {
  const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const [FEN, setFEN] = useState(startingFEN);
  const [socket, setSocket] = useState(io(`http://localhost:60001/game`));

  useEffect(() => {
    socket.on('connect', () => {
      console.log(`connected to socket ${socket.id}`);
    })

    socket.emit('join room', roomId);

    // listen for opponent moves
    socket.on('send move', (newFEN: string) => {
      // opponent sent FEN, update board
      setFEN(newFEN);
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
  function handleSendNextMove(newFEN: string) {
    // send FEN to opponent
    socket.emit('send move', { roomId: roomId, FEN: newFEN });
    // update own board
    setFEN(newFEN);
  }

  return (
    <div>
      <Board
        FEN={FEN}
        perspective={perspective}
        sendMove={handleSendNextMove}
      />
    </div>
  );
}

