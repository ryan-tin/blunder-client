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
  const socket = io(`http://localhost:60001/game`);

  useEffect(() => {
    socket.on('connect', () => {
      console.log(`connected to socket ${socket.id}`);
    })

    socket.emit('join room', roomId);

    socket.on('send move', (FEN: string) => {
      // TODO: send the new FEN to Board
      console.log('message', FEN);
    })

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    })

    return () => {
        socket.close();
    }
  }, [roomId, socket]);

  // TEST: 
  function handleClick() {
    socket.emit('send move', { roomId: roomId, FEN: "testFEN" });
  }

  return (
    <div>
      <button onClick={handleClick}>Click to send message</button>
      {
        // <Board
        //   FEN={FEN}
        //   perspective={perspective}
        //   sendMove={handleSendNextMove}
        // />
      }
    </div>
  );
}

