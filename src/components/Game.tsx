'use client'

import { playerType, lastMove, timeControl, historyEntry, coordinateType } from "@/types/Types";
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

  // history of moves
  const [moveHistory, setMoveHistory] = useState([{
    FEN: startingFEN,
    lastMove: {
      from: "" as coordinateType,
      to: "" as coordinateType
    },
    chessNotation: ""
  }] as historyEntry[]);
  const historyIndex = useRef(0);
  const inHistory = historyIndex.current !== moveHistory.length - 1;

  // timer states
  const [whiteTime, setWhiteTime] = useState(timeControl.totalTime * 60);
  const [blackTime, setBlackTime] = useState(timeControl.totalTime * 60);
  const [whiteTimerActive, setWhiteTimerActive] = useState(true);
  const [blackTimerActive, setBlackTimerActive] = useState(true);

  // states for panel
  const [panelProps, setPanelProps] = useState({
    checkmate: false,
    stalemate: false,
    winningPlayer: "" as playerType,
    timeOut: {
      isTimeOver: false,
      winner: '' as playerType
    }
  } as PanelProps);

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
    socket.on('send move', ({ FEN, lastMove, roomId, sentby, moveNotation }) => {
      // opponent sent FEN, update board
      setFEN(FEN);
      setLastMove(lastMove);
      processor.current.FEN = FEN;
      processor.current.RELOAD();
      toggleTimers();
      // store new history
      historyIndex.current = moveHistory.length;
      if (processor.current.checkmate) {
        moveNotation += '#';
      } else if (processor.current.kingCheckedPosition !== null) {
        moveNotation += '+';
      }
      setMoveHistory([...moveHistory, { FEN: FEN, lastMove: lastMove, chessNotation: moveNotation }])
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
  function handleSendNextMove(newFEN: string, lastMove: lastMove, moveNotation?: string) {
    let message = {
      roomId: roomId,
      sentBy: perspective,
      FEN: newFEN,
      lastMove: lastMove,
      moveNotation: moveNotation
    }
    // send FEN to opponent & yourself
    // update own board when the move arrives through socket
    socket.emit('send move', message);
  };

  /**
   * stop the timer in the server
   * updates game end message
   */
  function handleGameEnd(checkmate: boolean, stalemate: boolean, winner: playerType) {
    if (checkmate) {
      // additional if check so that state does not infinitely render
      // setState by default ALWAYS causes a component to rerender
      if (panelProps.checkmate !== true) {
        setPanelProps({
          ...panelProps,
          checkmate: true,
          winningPlayer: winner
        })
      }
    } else {
      if (panelProps.stalemate !== true) {
        setPanelProps({
          ...panelProps,
          stalemate: true
        });
      }
    }
    socket.emit('game end', roomId);
  };

  useEffect(() => {
    /**
     * use the arrow keys to move back and forth between history
     */
    function handleKeyDown(event: any) {
      // ignore auto repeated key presses (i.e., when key is held down)
      if (event.repeat === true) {
        return;
      }
      if (event.key === "ArrowUp") {
        historyIndex.current = 0;
      } else if (event.key === "ArrowDown") {
        historyIndex.current = moveHistory.length - 1;
      } else if (event.key === "ArrowLeft") {
        historyIndex.current = Math.max(historyIndex.current - 1, 0);
      } else if (event.key === "ArrowRight") {
        historyIndex.current = Math.min(historyIndex.current + 1, moveHistory.length - 1);
      } else {
        // don't do anything if any other key is pressed
        return;
      }
      setFEN(moveHistory[historyIndex.current].FEN);
      setLastMove(moveHistory[historyIndex.current].lastMove);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  })

  return (
    <div>
      <div className={gamestyles.game}>
        <div className={gamestyles["timer-parent-container"]}>
          <Timer
            time={perspective === 'w' ? blackTime : whiteTime}
            player={perspective === 'w' ? 'b' : 'w'}
            isActive={perspective === 'w' ? !whiteTimerActive : whiteTimerActive}
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
          inHistory={inHistory}
        />
        <div className={gamestyles['history-parent-container']}>
          <History moveHistory={moveHistory} historyIndex={historyIndex.current} />
        </div>
      </div>
      <Panel
        checkmate={panelProps.checkmate}
        stalemate={panelProps.stalemate}
        winningPlayer={panelProps.winningPlayer}
        timeOut={panelProps.timeOut}
      />
    </div>
  );
}

