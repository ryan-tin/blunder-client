'use client'

import { useState } from "react";
import Image from "next/image";
import styles from '@/styles/Lobby.module.css';
import commonStyles from '@/styles/common.module.css';
import Slider from '@mui/material/Slider';
import Box from "@mui/material/Box";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function Lobby() {
  const [gameCreated, setGameCreated] = useState(false);
  const [gameRows, setGameRows] = useState([] as gameRow[]);

  // selected values from sliders
  const [timePerSide, setTimePerSide] = useState(3);
  const [increment, setIncrement] = useState(5);

  function handleTimeChange(e: React.SyntheticEvent, value: number) {
    setTimePerSide(value);
  }

  function handleIncrementChange(e: React.SyntheticEvent, value: number) {
    setIncrement(value);
  }

  function handleSelectSide(e: any) {
    // TODO: add username
    let side = '';

    if (e.target.type === 'submit') {
      // random color picked
      const whiteProb = Math.random();
      if (whiteProb > 0.5) {
        side = 'white';
      } else {
        side = 'black';
      }
    }
    else if (e.target.alt === undefined) {
      return;
    }
    else if (e.target.alt.includes('White')) {
      side = 'white';
    } else if (e.target.alt.includes('Black')) {
      side = 'black';
    }
    e.stopPropagation();

    setGameRows([...gameRows, {
      time: `${timePerSide} + ${increment}`,
      name: 'todo',
      side: side
    }]);
  }

  return (
    <div className={commonStyles['centered-row-flex']}>
      <CreateGame
        showButton={!gameCreated}
        handleTimeChange={handleTimeChange}
        handleIncrementChange={handleIncrementChange}
        handleSelectSide={handleSelectSide}
      />
      <LobbyGames gameRows={gameRows} />
    </div>
  );
}

interface gameRow {
  name: string;
  time: string;
  side: string;
}

interface LobbyGamesProps {
  gameRows: gameRow[];
}

function LobbyGames({ gameRows }: LobbyGamesProps) {
  let rows: gameRow[] = gameRows;
  return (
    <div className={styles['lobby-games-container']}>
      <TableContainer>
        <Table sx={{
          minWidth: 650,
        }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <p className={styles['lobby-row']}>Name</p>
              </TableCell>
              <TableCell align="right">
                <p className={styles['lobby-row']}>Time</p>
              </TableCell>
              <TableCell align="right">
                <p className={styles['lobby-row']}>Side</p>
              </TableCell>
            </TableRow>

          </TableHead>
          <TableBody>
            {rows.map((row) => {
              // TODO: set key as socketid
              const randomKey = Math.random().toString(36).slice(2);
              return (
                <TableRow
                  key={randomKey}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <p className={styles['lobby-row']}> {row.name} </p>
                  </TableCell>
                  <TableCell align="right">
                    <p className={styles['lobby-row']}> {row.time} </p>
                  </TableCell>
                  <TableCell align="right">
                    <p className={styles['lobby-row']}> {row.side} </p>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function CreateGame(
  {
    showButton,
    handleTimeChange,
    handleIncrementChange,
    handleSelectSide
  }
    :
    {
      showButton: boolean,
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
      {showButton &&
        <button
          className={styles['create-game-button']}
          onClick={() => setShowGameOptions(!showGameOptions)}
        >
          Create Game
        </button>}
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
