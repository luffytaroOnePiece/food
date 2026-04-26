import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';
import { useBuilderStore } from '@store/builderStore';
import { CardShell } from '../cards/CardShell';
import { CARD_TYPE_LABELS, CARD_TYPE_ICONS } from '@/constants/cards';
import type { Stage as StageType, CardType } from '@app-types/recipe';
import styles from './Stage.module.css';

interface StageProps {
  stage: StageType;
}

const CARD_TYPES: CardType[] = ['ingredient', 'cookware', 'step', 'note'];

export function Stage({ stage }: StageProps) {
  const renameStage = useBuilderStore((s) => s.renameStage);
  const removeStage = useBuilderStore((s) => s.removeStage);
  const addCard = useBuilderStore((s) => s.addCard);
  const stageCount = useBuilderStore((s) => s.stages.length);

  const [showPopover, setShowPopover] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Close popover on click outside
  useEffect(() => {
    if (!showPopover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPopover]);

  const handleAddCard = (type: CardType) => {
    const card = addCard(stage.id, type);
    setEditingCardId(card.id);
    setShowPopover(false);
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.stage}>
      <div className={styles.stageHeader} {...attributes} {...listeners}>
        <input
          className={styles.stageName}
          value={stage.name}
          onChange={(e) => renameStage(stage.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Stage name…"
        />
        <div className={styles.stageActions}>
          <span className={styles.cardCount}>{stage.cards.length}</span>
          {stageCount > 1 && (
            <button
              className={`${styles.stageActionBtn} ${styles.danger}`}
              onClick={() => removeStage(stage.id)}
              title="Remove stage"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <SortableContext
        items={stage.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.cardsList}>
          <AnimatePresence mode="popLayout">
            {stage.cards.length === 0 && (
              <motion.div
                className={styles.emptyState}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Drop cards here
              </motion.div>
            )}
            {stage.cards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <CardShell
                  card={card}
                  stageId={stage.id}
                  isEditing={editingCardId === card.id}
                  onStartEdit={() => setEditingCardId(card.id)}
                  onStopEdit={() => setEditingCardId(null)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>

      <div className={styles.addCardArea} ref={popoverRef}>
        <AnimatePresence>
          {showPopover && (
            <motion.div
              className={styles.popover}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              {CARD_TYPES.map((type) => (
                <button
                  key={type}
                  className={styles.popoverItem}
                  onClick={() => handleAddCard(type)}
                >
                  <span className={styles.popoverIcon}>{CARD_TYPE_ICONS[type]}</span>
                  {CARD_TYPE_LABELS[type]}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className={styles.addCardBtn}
          onClick={() => setShowPopover(!showPopover)}
        >
          <Plus size={14} />
          Add Card
        </button>
      </div>
    </div>
  );
}
