import styles from './Spinner.module.css';

interface SpinnerProps {
  fullPage?: boolean;
}

export function Spinner({ fullPage }: SpinnerProps) {
  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        <div className={styles.ring} />
      </div>
    );
  }

  return (
    <div className={styles.spinner}>
      <div className={styles.ring} />
    </div>
  );
}
