import { useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { useBuilderStore } from '@store/builderStore';
import { IngredientCardView, IngredientCardEdit } from './IngredientCard';
import { CookwareCardView, CookwareCardEdit } from './CookwareCard';
import { StepCardView, StepCardEdit } from './StepCard';
import { NoteCardView, NoteCardEdit } from './NoteCard';
import type { AnyCard } from '@app-types/recipe';
import styles from './cards.module.css';

interface CardShellProps {
  card: AnyCard;
  stageId: string;
  isOverlay?: boolean;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onStopEdit?: () => void;
}

export function CardShell({
  card,
  stageId,
  isOverlay,
  isEditing = false,
  onStartEdit,
  onStopEdit,
}: CardShellProps) {
  const removeCard = useBuilderStore((s) => s.removeCard);
  const shellRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: isOverlay });

  const style = isOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  // Click outside to stop editing
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(e.target as Node)) {
        onStopEdit?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditing, onStopEdit]);

  // Escape to stop editing
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onStopEdit?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isEditing, onStopEdit]);

  const noteClass =
    card.type === 'note' && card.color
      ? styles[`note${card.color.charAt(0).toUpperCase() + card.color.slice(1)}`]
      : '';

  const classNames = [
    styles.cardShell,
    isEditing ? styles.editing : '',
    isOverlay ? styles.overlay : '',
    noteClass,
  ]
    .filter(Boolean)
    .join(' ');

  const renderView = () => {
    switch (card.type) {
      case 'ingredient':
        return <IngredientCardView card={card} />;
      case 'cookware':
        return <CookwareCardView card={card} />;
      case 'step':
        return <StepCardView card={card} />;
      case 'note':
        return <NoteCardView card={card} />;
    }
  };

  const renderEdit = () => {
    switch (card.type) {
      case 'ingredient':
        return <IngredientCardEdit card={card} stageId={stageId} />;
      case 'cookware':
        return <CookwareCardEdit card={card} stageId={stageId} />;
      case 'step':
        return <StepCardEdit card={card} stageId={stageId} />;
      case 'note':
        return <NoteCardEdit card={card} stageId={stageId} />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={classNames}>
      <div
        ref={shellRef}
        style={{ display: 'flex', flex: 1, minWidth: 0 }}
      >
        {!isOverlay && (
          <div className={styles.dragHandle} {...attributes} {...listeners}>
            ⠿
          </div>
        )}
        <div
          className={`${styles.cardContent} ${isEditing ? styles.editMode : ''}`}
          onClick={() => {
            if (!isEditing && !isOverlay) onStartEdit?.();
          }}
        >
          {isEditing ? renderEdit() : (
            <div className={styles.cardView}>
              {renderView()}
              {!isOverlay && (
                <div className={styles.cardActions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCard(stageId, card.id);
                    }}
                    title="Delete card"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
