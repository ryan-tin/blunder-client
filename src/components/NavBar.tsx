import Link from "next/link";
import styles from '@/styles/NavBar.module.css';

export default function NavBar() {
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
          href='/'
          className={styles.Link}
          target="_self"
        >
          Log In/Sign Up
        </Link>
        <Link
          href='/test'
          className={styles.Link}
          target="_self"
        >
          testing
        </Link>
      </div>

    </header>
  );
}
