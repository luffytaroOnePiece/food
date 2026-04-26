import { useBuilderStore } from '@store/builderStore';
import { UNIT_OPTIONS } from '@/constants/cards';
import type { IngredientCard as IngredientCardType } from '@app-types/recipe';
import styles from './cards.module.css';

interface ViewProps {
  card: IngredientCardType;
}

export function IngredientCardView({ card }: ViewProps) {
  return (
    <>
      <span className={styles.cardIcon}>🧅</span>
      <div className={styles.cardInfo}>
        <div className={styles.cardTitle}>
          {card.name || 'Untitled ingredient'}
        </div>
        <div className={styles.cardSubtitle}>
          {card.quantity > 0 ? `${card.quantity} ${card.unit}` : 'No quantity set'}
          {card.notes ? ` · ${card.notes}` : ''}
        </div>
      </div>
    </>
  );
}

interface EditProps {
  card: IngredientCardType;
  stageId: string;
}

export function IngredientCardEdit({ card, stageId }: EditProps) {
  const updateCard = useBuilderStore((s) => s.updateCard);

  return (
    <div className={styles.editForm}>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Name</label>
        <input
          className={styles.editInput}
          value={card.name}
          onChange={(e) => updateCard(stageId, card.id, { name: e.target.value })}
          placeholder="e.g. Garlic"
          autoFocus
        />
      </div>
      <div className={styles.editRow}>
        <div className={styles.editField}>
          <label className={styles.editLabel}>Qty</label>
          <input
            className={styles.editInput}
            type="number"
            value={card.quantity || ''}
            onChange={(e) => updateCard(stageId, card.id, { quantity: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            min={0}
            step="any"
          />
        </div>
        <div className={styles.editField}>
          <label className={styles.editLabel}>Unit</label>
          <select
            className={styles.editSelect}
            value={card.unit}
            onChange={(e) => updateCard(stageId, card.id, { unit: e.target.value })}
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Notes</label>
        <input
          className={styles.editInput}
          value={card.notes || ''}
          onChange={(e) => updateCard(stageId, card.id, { notes: e.target.value })}
          placeholder="e.g. finely minced"
        />
      </div>
    </div>
  );
}
