'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import styles from '@/styles/Lobby.module.css';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function LobbyGames({ gameRows }: { gameRows: any }) {
  const supabase = createClientComponentClient();
  const [rows, setRows] = useState(gameRows);

  // refresh page if 'lobby' database changes
  useEffect(() => {
    const channel = supabase.channel('realtime lobby').on('postgres_changes', {
      event: '*', // listen to all Inserts, Updates, and Deletes
      schema: 'public',
      table: 'lobby'
    }, (payload: any) => {
      const fetchUsername = async (userId: any) => {
        const { data } = await supabase.from('profiles').select('username').eq('id', userId)
        return data;
      }

      let username;
      fetchUsername(payload.new.user_id).then((data) => {
        username = data![0].username;
        setRows([...rows,
        {
          ...payload.new,
          profiles: {
            username: username
          }
        }])
      });

    }).subscribe()

    return () => {
      supabase.removeChannel(channel);
    }
  }, [rows, supabase])

  function handleGameClick(e: any) {
    // TODO: cannot join own game!
    console.log('a game has been clicked!');
    // TODO: redirect to the game
    // window.location.assign("http://localhost:3000/");
    e.stopPropagation();
  }

  // TODO: feat: cancel game if its your own 
  return (
    <div className={styles['lobby-games-container']}>
      <TableContainer>
        <Table sx={{
          minWidth: 650,
        }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <p className={styles['lobby-row']}>Username</p>
              </TableCell>
              <TableCell align="right">
                <p className={styles['lobby-row']}>Time</p>
              </TableCell>
              <TableCell align="right">
                <p className={styles['lobby-row']}>Your/Opponent Side</p>
              </TableCell>
              <TableCell align="right">
                <p className={styles['lobby-row']}>Action</p>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: any) => {
              return (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <p className={styles['lobby-row']}> {row.profiles.username} </p>
                  </TableCell>
                  <TableCell align="right">
                    <p className={styles['lobby-row']}> {`${row.time} + ${row.increment}`} </p>
                  </TableCell>
                  <TableCell align="right">
                    <p className={styles['lobby-row']}> {row.side} </p>
                  </TableCell>
                  <TableCell align="right">
                    <button onClick={(e) => handleGameClick(e)}>Join</button>
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
