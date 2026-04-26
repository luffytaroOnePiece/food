import { useBuilderStore } from '@store/builderStore';
import { ItemCombobox } from '@shared/ui/ItemCombobox/ItemCombobox';
import type { CookwareCard as CookwareCardType } from '@app-types/recipe';
import styles from './cards.module.css';

interface ViewProps {
  card: CookwareCardType;
}

export function CookwareCardView({ card }: ViewProps) {
  return (
    <>
      <span className={styles.cardIcon}>{card.emoji || '🍳'}</span>
      <div className={styles.cardInfo}>
        <div className={styles.cardTitle}>
          {card.name || 'Untitled cookware'}
        </div>
        {card.detail && (
          <div className={styles.cardSubtitle}>{card.detail}</div>
        )}
      </div>
    </>
  );
}

interface EditProps {
  card: CookwareCardType;
  stageId: string;
}

export function CookwareCardEdit({ card, stageId }: EditProps) {
  const updateCard = useBuilderStore((s) => s.updateCard);

  return (
    <div className={styles.editForm}>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Name</label>
        <ItemCombobox
          catalogType="cookware"
          value={card.name}
          emoji={card.emoji}
          onChange={(name, emoji) => updateCard(stageId, card.id, { name, emoji })}
          placeholder="Search cookware…"
          autoFocus
        />
      </div>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Detail</label>
        <input
          className={styles.editInput}
          value={card.detail || ''}
          onChange={(e) => updateCard(stageId, card.id, { detail: e.target.value })}
          placeholder="e.g. 12-inch, seasoned"
        />
      </div>
    </div>
  );
}
