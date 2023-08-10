import NavBar from '@/components/NavBar'
import Game from '@/components/Game'
import styles from '@/styles/App.module.css';

export default function Home() {
  return (
    <main className={styles.App}>
      <NavBar />
      <div className={styles['game-container']}>
        <Game perspective='w' />
      </div>
    </main>
  )
}
