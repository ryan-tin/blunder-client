import NavBar from '@/components/NavBar'
import Lobby from '@/components/Lobby';
import styles from '@/styles/App.module.css';

export default function Home() {
  return (
    <main className={styles.App}>
      <NavBar />
      <Lobby />
    </main>
  )
}
