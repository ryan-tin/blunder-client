'use client'

import { useState } from "react";
import Image from "next/image";
import styles from '@/styles/Lobby.module.css';
import commonStyles from '@/styles/common.module.css';

export default function Lobby() {
  const [gameCreated, setGameCreated] = useState(false);

  return (
    <div>
      <CreateGame showButton={!gameCreated} />
    </div>
  );
}

function CreateGame({ showButton }: any) {
  const [showGameOptions, setShowGameOptions] = useState(false);

  return (
    <div
      className={commonStyles['centered-column-flex']}
    >
      {showButton &&
        <button
          className={styles['create-game-button']}
          onClick={() => setShowGameOptions(!showGameOptions)}
        >
          Create Game
        </button>}
      {showGameOptions && <GameOptions />}
    </div>
  );
}

function GameOptions() {
  return (
    <div className={styles['game-options-container']}>
      <div>
        <h2
          style={{ color: 'white' }}
        >Time Control</h2>
        <TimeControlOptions />
      </div>
      <div>
        <h2
          style={{ color: 'white' }}
        >Choose side:</h2>
        <SideOptions />
      </div>
    </div>
  );
}

function TimeControlOptions() {
  return (
    <div>
      <TimeControlButton timePerSide={2} increment={1} />
      <TimeControlButton timePerSide={3} increment={2} />
      <TimeControlButton timePerSide={5} increment={3} />
      <TimeControlButton timePerSide={10} increment={5} />
      <TimeControlButton timePerSide={15} increment={10} />
    </div>
  );
}

interface TimeControlButtonProps {
  timePerSide: number;
  increment: number;
}

function TimeControlButton(props: TimeControlButtonProps) {
  return (
    <button className={styles['time-control-button']}>
      {`${props.timePerSide} + ${props.increment}`}
    </button>
  )
}

function SideOptions() {
  return (
    <div className={styles['choose-side-container']}>
      <button>
        <Image
          priority
          alt="play as White"
          src='/assets/cburnett/wK.svg'
          width={0}
          height={0}
          className={styles['color-button']}
        ></Image>
      </button>
      <button
        className={styles['random-color-button']}
      > Random </button>
      <button>
        <Image
          priority
          alt="play as Black"
          src='/assets/cburnett/bK.svg'
          height={10}
          width={10}
          className={styles['color-button']}
        ></Image>
      </button>

    </div>
  );
}
