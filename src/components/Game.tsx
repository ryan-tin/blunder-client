'use client'

import { playerType, lastMove, timeControl } from "@/types/Types";
import Board from "@/components/Board";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { Processor } from '@/utils/Processor';
import Timer from "@/components/Timer";

interface GameProps {
  perspective: playerType;
  roomId: string;
  timeControl: timeControl;
}

const DEBUG = false;

export default function Game({ perspective, roomId, timeControl }: GameProps) {
  const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const [FEN, setFEN] = useState(startingFEN);
  const socket = io('http://localhost:60001/game', { autoConnect: false });
  const [lastMove, setLastMove] = useState({ from: null, to: null } as lastMove)
  const processor = useRef(Processor.Instance);
  const [whiteTime, setWhiteTime] = useState(timeControl.totalTime * 60);
  const [blackTime, setBlackTime] = useState(timeControl.totalTime * 60);

  // useEffect:
  // populated dependency array makes useEffect run on dependency change
  // empty dependency array makes useEffect run only after the initial render
  // no dependency array makes this run after every render
  useEffect(() => {
    socket.connect(); // does not reconnect if a connection is already established
    socket.on('connect', () => {
      // console.log(`connected to socket ${socket.id}`);
    })

    // join game room and send time control info to server
    socket.emit('game setup', roomId, timeControl);

    // server sends updated times once every second
    socket.on('time', (message: any) => {
      // console.log('time', message);
      setWhiteTime(message.white);
      setBlackTime(message.black);
    })

    // listen for opponent moves
    socket.on('send move', (message: any) => {
      // opponent sent FEN, update board
      // console.log('send move', message);
      setFEN(message.FEN);
      setLastMove(message.lastMove);
      processor.current.FEN = message.FEN;
    })

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    })

    return () => {
      socket.disconnect();
    }
  }, [roomId, socket, timeControl]);

  // send move to opponent
  function handleSendNextMove(newFEN: string, lastMove: lastMove) {
    let message = {
      roomId: roomId,
      sentBy: perspective,
      FEN: newFEN,
      lastMove: lastMove
    }
    // send FEN to opponent & yourself
    socket.emit('send move', message);
    // update own board
    // setFEN(newFEN);
    // setLastMove(lastMove);
    // processor.FEN = newFEN;
  }

  return (
    <div>
      <h1>
        {DEBUG && `total time: ${timeControl.totalTime}, increment: ${timeControl.increment}`}
      </h1>
      <Timer
        time={perspective === 'w' ? blackTime : whiteTime}
        player={perspective === 'w' ? 'b' : 'w'}
      />
      <Board
        FEN={FEN}
        lastMove={lastMove}
        perspective={perspective}
        sendMove={handleSendNextMove}
      />
      <Timer
        time={perspective === 'w' ? whiteTime : blackTime}
        player={perspective}
      />
    </div>
  );
}

