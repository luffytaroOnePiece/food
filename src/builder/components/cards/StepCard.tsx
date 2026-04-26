import { Timer } from 'lucide-react';
import { useBuilderStore } from '@store/builderStore';
import type { StepCard as StepCardType } from '@app-types/recipe';
import styles from './cards.module.css';

interface ViewProps {
  card: StepCardType;
}

export function StepCardView({ card }: ViewProps) {
  return (
    <>
      <span className={styles.cardIcon}>📋</span>
      <div className={styles.cardInfo}>
        <div className={styles.cardTitle}>
          {card.text || 'Untitled step'}
        </div>
        {card.timerMinutes && card.timerMinutes > 0 && (
          <span className={styles.timerBadge}>
            <Timer size={10} />
            {card.timerMinutes}m
          </span>
        )}
      </div>
    </>
  );
}

interface EditProps {
  card: StepCardType;
  stageId: string;
}

export function StepCardEdit({ card, stageId }: EditProps) {
  const updateCard = useBuilderStore((s) => s.updateCard);

  return (
    <div className={styles.editForm}>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Instruction</label>
        <textarea
          className={styles.editTextarea}
          value={card.text}
          onChange={(e) => updateCard(stageId, card.id, { text: e.target.value })}
          placeholder="Describe this step…"
          autoFocus
        />
      </div>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Timer (minutes)</label>
        <input
          className={styles.editInput}
          type="number"
          value={card.timerMinutes || ''}
          onChange={(e) => updateCard(stageId, card.id, { timerMinutes: parseInt(e.target.value) || 0 })}
          placeholder="0"
          min={0}
        />
      </div>
    </div>
  );
}
