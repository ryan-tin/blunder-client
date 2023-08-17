import Lobby from '@/app/Lobby';
import styles from '@/styles/App.module.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';


export default async function Home() {

  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()


  let { data: gameRows, error } = await supabase
    .from('lobby').select('*, profiles (username)');

  if (error) {
    console.log(error)
  }

  return (
    <main className={styles.App}>
      <div className={styles['home-lobby']}>
        <Lobby session={session} lobbyGames={gameRows} />
      </div>
    </main>
  )
}
