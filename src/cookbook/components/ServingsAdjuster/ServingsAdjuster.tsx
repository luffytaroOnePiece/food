import { Minus, Plus } from 'lucide-react';
import styles from './ServingsAdjuster.module.css';

interface ServingsAdjusterProps {
  servings: number;
  baseServings: number;
  onChange: (value: number) => void;
}

export function ServingsAdjuster({ servings, baseServings, onChange }: ServingsAdjusterProps) {
  return (
    <div className={styles.adjuster}>
      <span className={styles.label}>Servings</span>
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => onChange(Math.max(1, servings - 1))}
          disabled={servings <= 1}
          aria-label="Decrease servings"
        >
          <Minus size={14} />
        </button>
        <span className={`${styles.value} ${servings !== baseServings ? styles.scaled : ''}`}>
          {servings}
        </span>
        <button
          className={styles.btn}
          onClick={() => onChange(servings + 1)}
          aria-label="Increase servings"
        >
          <Plus size={14} />
        </button>
      </div>
      {servings !== baseServings && (
        <button className={styles.reset} onClick={() => onChange(baseServings)}>
          Reset to {baseServings}
        </button>
      )}
    </div>
  );
}
