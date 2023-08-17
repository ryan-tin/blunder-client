'use client'

import { useState } from "react";
import Image from "next/image";
import styles from '@/styles/Lobby.module.css';
import commonStyles from '@/styles/common.module.css';
import { Slider, Box } from '@mui/material';
import { Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LobbyGames from '@/app/realtime-lobby';

export default function Lobby({ session, lobbyGames }:
  { session: Session | null, lobbyGames: any[] | null }
) {
  const supabase = createClientComponentClient();
  // selected values from sliders
  const [timePerSide, setTimePerSide] = useState(3);
  const [increment, setIncrement] = useState(5);

  async function handleSelectSide(e: any) {
    let side = '';
    if (e.target.type === 'submit') {
      // random color picked
      const whiteProb = Math.random();
      if (whiteProb > 0.5) { side = 'white'; }
      else { side = 'black'; }
    }
    else if (e.target.alt === undefined) {
      return;
    }
    else if (e.target.alt.includes('White')) {
      side = 'white';
    } else if (e.target.alt.includes('Black')) {
      side = 'black';
    }
    const portNum = await findUniquePort();

    // insert row into database
    try {
      const { error } = await supabase
        .from('lobby')
        .insert({
          port_num: portNum,
          side: side,
          time: timePerSide,
          increment: increment,
          user_id: session?.user?.id
        })

      if (error) { throw error; }
    } catch (error) {
      console.log(error)
    }

    e.stopPropagation();
  }

  function handleTimeChange(e: React.SyntheticEvent, value: number) {
    setTimePerSide(value);
    e.stopPropagation();
  }

  function handleIncrementChange(e: React.SyntheticEvent, value: number) {
    setIncrement(value);
    e.stopPropagation();
  }

  function generateRandomPort(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async function checkPortExists(portNum: number) {
    const { data, error } = await supabase
      .from('lobby')
      .select()
      .eq("port_num", portNum);

    if (error) {
      throw error;
    }

    return data.length > 0;
  }

  // async loop to check for port
  async function findUniquePort() {
    while (true) {
      const randomPort = generateRandomPort(50000, 60000);
      const valueExists = await checkPortExists(randomPort);
      if (!valueExists) {
        return randomPort;
      }
    }
  }

  return (
    <div className={commonStyles['centered-row-flex']}>
      <CreateGame
        handleTimeChange={handleTimeChange}
        handleIncrementChange={handleIncrementChange}
        handleSelectSide={handleSelectSide}
      />
      <LobbyGames gameRows={lobbyGames} session={session}/>
    </div>
  );
}

function CreateGame(
  {
    handleTimeChange,
    handleIncrementChange,
    handleSelectSide
  }
    :
    {
      handleTimeChange: Function,
      handleIncrementChange: Function,
      handleSelectSide: Function
    }
) {
  const [showGameOptions, setShowGameOptions] = useState(false);

  return (
    <div
      className={commonStyles['centered-column-flex']}
    >
      <button
        className={styles['create-game-button']}
        onClick={() => setShowGameOptions(!showGameOptions)}
      >
        Create Game
      </button>
      {showGameOptions &&
        <GameOptions
          handleTimeChange={handleTimeChange}
          handleIncrementChange={handleIncrementChange}
          handleSelectSide={handleSelectSide}
        />}
    </div>
  );
}

function GameOptions(
  { handleTimeChange, handleIncrementChange, handleSelectSide }
    : {
      handleTimeChange: Function,
      handleIncrementChange: Function,
      handleSelectSide: Function
    }
) {
  return (
    <div className={styles['game-options-container']}>
      <div>
        <h2
          style={{ color: 'white' }}
        >Time Control</h2>
        <TimeControlOptions
          handleTimeChange={handleTimeChange}
          handleIncrementChange={handleIncrementChange}
        />
      </div>
      <div>
        <h2
          style={{ color: 'white' }}
        >Choose side:</h2>
        <SideOptions handleSelectSide={handleSelectSide} />
      </div>
    </div>
  );
}

function TimeControlOptions(
  { handleTimeChange, handleIncrementChange }
    : {
      handleTimeChange: Function,
      handleIncrementChange: Function
    }
) {
  const [timePerSide, setTimePerSide] = useState(3);
  const [increment, setIncrement] = useState(5);

  return (
    <div className={commonStyles["centered-column-flex"]}>
      <Box sx={{ width: "20vw" }}>
        <p style={{ color: "white" }}>
          {`Time per side: ${timePerSide} minutes`}
        </p>
        <Slider
          min={1}
          max={15}
          defaultValue={3}
          onChange={(e, value) => { setTimePerSide(value as number) }}
          onChangeCommitted={(e, value) => {
            handleTimeChange(e, value as number);
          }}
        />
        <p style={{ color: "white" }}>
          {`Increment per move: ${increment} seconds`}
        </p>
        <Slider
          defaultValue={5}
          min={0}
          max={15}
          onChange={(e, value) => { setIncrement(value as number) }}
          onChangeCommitted={(e, value) => {
            setIncrement(value as number);
            handleIncrementChange(e, value as number);
          }}
        />
      </Box>
    </div>
  );
}

function SideOptions({ handleSelectSide }: { handleSelectSide: Function }) {
  return (
    <div className={styles['choose-side-container']}>

      <button onClick={e => handleSelectSide(e)} >
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
        onClick={e => handleSelectSide(e)}
      >
        Random
      </button>

      <button onClick={e => handleSelectSide(e)}>
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
