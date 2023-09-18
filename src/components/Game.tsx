'use client'

import { playerType, lastMove, timeControl } from "@/types/Types";
import Board from "@/components/Board";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { Processor } from '@/utils/Processor';
import Timer from "@/components/Timer";
import gamestyles from '@/styles/Game.module.css';
import Panel, { PanelProps } from "@/components/Panel";
import History from "@/components/History";

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

  // timer states
  const [whiteTime, setWhiteTime] = useState(timeControl.totalTime * 60);
  const [blackTime, setBlackTime] = useState(timeControl.totalTime * 60);
  const [whiteTimerActive, setWhiteTimerActive] = useState(true);
  const [blackTimerActive, setBlackTimerActive] = useState(true);

  // panel state
  const [panelProps, setPanelProps] = useState({
    checkmate: false,
    stalemate: false,
    winningPlayer: "" as playerType,
    timeOut: {
      isTimeOver: false,
      winner: '' as playerType
    }
  } as PanelProps );


  // useEffect:
  // populated dependency array makes useEffect run on dependency change
  // empty dependency array makes useEffect run only after the initial render
  // no dependency array makes this run after every render
  // BUG: socket reconnects and disconnects every tick
  useEffect(() => {
    socket.connect(); // does not reconnect if a connection is already established
    socket.on('connect', () => {
      // console.log(`connected to socket ${socket.id}`);
    })

    // join game room and send time control info to server
    socket.emit('game setup', roomId, timeControl);

    // server sends updated times once every second
    socket.on('time', (message: any) => {
      setWhiteTime(message.white);
      setBlackTime(message.black);
      // if a player runs out of time, they lose
      if (message.white <= 0) {
        setPanelProps({
          ...panelProps,
          timeOut: {
            isTimeOver: true,
            winner: 'b' as playerType
          }
        });
      } else if (message.black <= 0) {
        // should be true
        setPanelProps({
          ...panelProps,
          timeOut: {
            isTimeOver: true,
            winner: 'w' as playerType
          }
        });
      }
    })

    // listen for opponent moves
    // NOTE: also recieves your own moves
    socket.on('send move', ({ FEN, lastMove, roomId, sentby }) => {
      // opponent sent FEN, update board
      setFEN(FEN);
      setLastMove(lastMove);
      processor.current.FEN = FEN;
      toggleTimers();
    })

    /**
     * toggle active timers
     */
    function toggleTimers() {
      setWhiteTimerActive(!whiteTimerActive);
      setBlackTimerActive(!blackTimerActive);
    }


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
    // update own board when the move arrives through socket
    socket.emit('send move', message);
  }

  /**
   * stop the timer in the server
   * updates game end message
   */
  function handleGameEnd(checkmate: boolean, stalemate: boolean, winner: playerType) {
    if (!checkmate && !stalemate) {
      return;
    } else if (checkmate) {
      setPanelProps({
        ...panelProps,
        checkmate: true,
        winningPlayer: winner
      })
    } else {
      setPanelProps({
        ...panelProps,
        stalemate: true
      });
    }
    socket.emit('game end', roomId);
  }

  return (
    <div className={gamestyles.game}>
      {
        DEBUG &&
        <h1>
          {`total time: ${timeControl.totalTime}, increment: ${timeControl.increment}`}
        </h1>
      }
      <div className={gamestyles["timer-parent-container"]}>
        <Timer
          time={perspective === 'w' ? blackTime : whiteTime}
          player={perspective === 'w' ? 'b' : 'w'}
          isActive={perspective === 'w' ? !whiteTimerActive : whiteTimerActive}
        />
        <Panel
          checkmate={panelProps.checkmate}
          stalemate={panelProps.stalemate}
          winningPlayer={panelProps.winningPlayer}
          timeOut={panelProps.timeOut}
        />
        <Timer
          time={perspective === 'w' ? whiteTime : blackTime}
          player={perspective}
          isActive={perspective === 'w' ? whiteTimerActive : !whiteTimerActive}
        />
      </div>
      <Board
        FEN={FEN}
        lastMove={lastMove}
        perspective={perspective}
        sendMove={handleSendNextMove}
        gameEnd={handleGameEnd}
        gameOverFlag={panelProps.timeOut.isTimeOver}
      />
      <div className={gamestyles['history-parent-container']}>
        <History />
      </div>
    </div>
  );
}

