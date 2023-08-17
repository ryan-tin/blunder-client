'use client'

import { Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import styles from '@/styles/Lobby.module.css';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function LobbyGames({ session, gameRows }:
  { session: Session | null, gameRows: any }
) {
  const supabase = createClientComponentClient();
  const [rows, setRows] = useState(gameRows);

  // refresh page if 'lobby' database changes
  useEffect(() => {
    const insertChannel = supabase.channel('realtime lobby inserts')
      .on('postgres_changes', {
        event: 'INSERT',
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

    const deleteChannel = supabase.channel('realtime lobby deletes')
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'lobby'
      }, (payload: any) => {
        setRows(rows.filter((row: any) => row.id !== payload.old.id))
      }).subscribe()

    return () => {
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(deleteChannel);
    }
  }, [rows, supabase])

  async function deleteGame(row: any) {
    const { error } = await supabase.from('lobby').delete().eq('id', row.id);
    if (error) {
      // console.log(error);
      throw error;
    }
  }

  function handleGameClick(e: any, row: any) {
    const yourGame = row.user_id === session?.user.id;
    if (yourGame) {
      // delete your own game
      deleteGame(row);
    } else {
      // join game
      console.log('join');
      // console.log(window.location.host);
      // window.location.assign(`${window.location.host}/:${row.port_num}`)
    }
    // TODO: redirect to the game
    // how to automaticaaly join game once opponent joins?
    // window.location.assign("http://localhost:3000/");
    e.stopPropagation();
  }

  return (
    <div className={styles['lobby-games-container']}>
      <TableContainer>
        <Table sx={{
          minWidth: 650,
        }}
          size="small"
        >
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
              {
                // <TableCell align="right">
                //   <p className={styles['lobby-row']}>Action</p>
                //   </TableCell>
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: any) => {
              return (
                <TableRow
                  key={row.id}
                  sx={{
                    ":hover": { backgroundColor: "var(--custom-color-brand)" }
                  }}
                  onClick={(e) => handleGameClick(e, row)}
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
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
