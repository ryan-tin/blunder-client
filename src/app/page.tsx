import Lobby from '@/components/Lobby';
import styles from '@/styles/App.module.css';

export default function Home() {
  return (
    <main className={styles.App}>
      <div className={styles['home-lobby']}>
        <Lobby />
      </div>
    </main>
  )
}
