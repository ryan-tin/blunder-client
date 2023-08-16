'use client'

import Link from "next/link";
import styles from '@/styles/NavBar.module.css';
import { Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCallback, useEffect, useState } from "react";

export default function NavBar({ session }: { session: Session | null }) {
  const supabase = createClientComponentClient();
  const [username, setUsername] = useState<string | null>(null);
  const user = session?.user;

  const getUsername = useCallback(async () => {
    try {
      let { data, error, status } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user?.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username === "" ? null : data.username);
      }

    } catch (error) {
      // alert("Error loading username")
      console.log(error);
    }
  }, [user, supabase])

  useEffect(() => {
    if (user !== undefined) {
      getUsername();
    }
  }, [user, getUsername])

  return (
    <header className={styles.NavBar}>

      <Link
        href='/'
        className={`${styles.Link} ${styles.BlunderLink}`}
        target="_self"
      >
        blunder
      </Link>

      <div className={styles.SublinkContainer}>
        <Link
          href={session ? '/account' : '/login'}
          className={styles.Link}
          target="_self"
        >
          {
            session ? (username === null ? "Account" : username) : "Log In/Sign Up"
          }
        </Link>
      </div>

    </header>
  );
}
