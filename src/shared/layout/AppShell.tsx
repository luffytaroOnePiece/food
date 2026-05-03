import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Hammer, ImageIcon } from 'lucide-react';
import styles from './AppShell.module.css';

const isDev = import.meta.env.DEV;

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🍳</span>
          Recipe Cookbook
        </Link>

        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navLink} ${path === '/' ? styles.active : ''}`}
          >
            <BookOpen size={16} />
            Cookbook
          </Link>

          <Link
            to="/gallery"
            className={`${styles.navLink} ${path === '/gallery' ? styles.active : ''}`}
          >
            <ImageIcon size={16} />
            Gallery
          </Link>

          {isDev && (
            <>
              <Link
                to="/builder"
                className={`${styles.navLink} ${path === '/builder' ? styles.active : ''}`}
              >
                <Hammer size={16} />
                Builder
              </Link>
              <span className={styles.devBadge}>DEV</span>
            </>
          )}
        </nav>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
