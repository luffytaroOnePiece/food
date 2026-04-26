import { useBuilderStore } from '@store/builderStore';
import { Modal } from '@shared/ui/Modal/Modal';
import { Badge } from '@shared/ui/Badge/Badge';
import { CARD_TYPE_LABELS } from '@/constants/cards';
import styles from './PreviewModal.module.css';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
}

export function PreviewModal({ open, onClose }: PreviewModalProps) {
  const meta = useBuilderStore((s) => s.meta);
  const stages = useBuilderStore((s) => s.stages);

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.previewContent}>
        {/* Header */}
        <div className={styles.previewHeader}>
          <span className={styles.previewIcon}>{meta.icon || '🍽️'}</span>
          <h1 className={styles.previewTitle}>
            {meta.name || 'Untitled Recipe'}
          </h1>
          {meta.description && (
            <p className={styles.previewDesc}>{meta.description}</p>
          )}
        </div>

        {/* Meta row */}
        <div className={styles.previewMeta}>
          {meta.cuisine && (
            <div className={styles.metaItem}>
              <div className={styles.metaValue}>{meta.cuisine}</div>
              <div className={styles.metaLabel}>Cuisine</div>
            </div>
          )}
          <div className={styles.metaItem}>
            <div className={styles.metaValue}>{meta.servings}</div>
            <div className={styles.metaLabel}>Servings</div>
          </div>
          {meta.prepTime > 0 && (
            <div className={styles.metaItem}>
              <div className={styles.metaValue}>{meta.prepTime}m</div>
              <div className={styles.metaLabel}>Prep</div>
            </div>
          )}
          {meta.cookTime > 0 && (
            <div className={styles.metaItem}>
              <div className={styles.metaValue}>{meta.cookTime}m</div>
              <div className={styles.metaLabel}>Cook</div>
            </div>
          )}
        </div>

        {/* Stages */}
        {stages.map((stage) => (
          <div key={stage.id} className={styles.previewStage}>
            <h2 className={styles.stageName}>{stage.name}</h2>
            <div className={styles.cardList}>
              {stage.cards.map((card) => (
                <div
                  key={card.id}
                  className={`${styles.previewCard} ${card.type === 'note' ? styles.note : ''}`}
                >
                  <div className={styles.cardType}>{CARD_TYPE_LABELS[card.type]}</div>
                  <div className={styles.cardBody}>
                    {card.type === 'ingredient' && (
                      <>
                        <strong>{card.name}</strong>
                        {card.quantity > 0 && ` — ${card.quantity} ${card.unit}`}
                        {card.notes && (
                          <div className={styles.cardDetail}>{card.notes}</div>
                        )}
                      </>
                    )}
                    {card.type === 'cookware' && (
                      <>
                        <strong>{card.name}</strong>
                        {card.detail && (
                          <div className={styles.cardDetail}>{card.detail}</div>
                        )}
                      </>
                    )}
                    {card.type === 'step' && (
                      <>
                        {card.text}
                        {card.timerMinutes && card.timerMinutes > 0 && (
                          <div className={styles.cardDetail}>⏱ {card.timerMinutes} minutes</div>
                        )}
                      </>
                    )}
                    {card.type === 'note' && card.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Tags */}
        {meta.tags.length > 0 && (
          <div className={styles.tags}>
            {meta.tags.map((tag) => (
              <Badge key={tag} variant="saffron">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
