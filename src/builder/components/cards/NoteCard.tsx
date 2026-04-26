import { useBuilderStore } from '@store/builderStore';
import type { NoteCard as NoteCardType } from '@app-types/recipe';
import styles from './cards.module.css';

interface ViewProps {
  card: NoteCardType;
}

export function NoteCardView({ card }: ViewProps) {
  return (
    <>
      <span className={styles.cardIcon}>📝</span>
      <div className={styles.cardInfo}>
        <div className={styles.cardTitle}>
          {card.text || 'Empty note'}
        </div>
      </div>
    </>
  );
}

interface EditProps {
  card: NoteCardType;
  stageId: string;
}

const NOTE_COLORS = ['yellow', 'green', 'pink', 'blue'] as const;

export function NoteCardEdit({ card, stageId }: EditProps) {
  const updateCard = useBuilderStore((s) => s.updateCard);

  return (
    <div className={styles.editForm}>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Note</label>
        <textarea
          className={styles.editTextarea}
          value={card.text}
          onChange={(e) => updateCard(stageId, card.id, { text: e.target.value })}
          placeholder="Write a tip or note…"
          autoFocus
        />
      </div>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Color</label>
        <div className={styles.colorPicker}>
          {NOTE_COLORS.map((color) => (
            <button
              key={color}
              className={`${styles.colorSwatch} ${
                styles[`swatch${color.charAt(0).toUpperCase() + color.slice(1)}`]
              } ${card.color === color ? styles.active : ''}`}
              onClick={() => updateCard(stageId, card.id, { color })}
              title={color}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
