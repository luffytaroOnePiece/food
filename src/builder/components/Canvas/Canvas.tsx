import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useBuilderStore } from '@store/builderStore';
import { Stage } from '../Stage/Stage';
import { CardShell } from '../cards/CardShell';
import type { AnyCard } from '@app-types/recipe';
import styles from './Canvas.module.css';

export function Canvas() {
  const stages = useBuilderStore((s) => s.stages);
  const addStage = useBuilderStore((s) => s.addStage);
  const moveCard = useBuilderStore((s) => s.moveCard);
  const reorderStages = useBuilderStore((s) => s.reorderStages);

  const [activeCard, setActiveCard] = useState<AnyCard | null>(null);
  const [_activeStageId, setActiveStageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const findStageAndIndex = useCallback(
    (cardId: string) => {
      for (const stage of stages) {
        const idx = stage.cards.findIndex((c) => c.id === cardId);
        if (idx !== -1) return { stageId: stage.id, index: idx, card: stage.cards[idx] };
      }
      return null;
    },
    [stages]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const id = String(active.id);

      // Check if it's a card
      const found = findStageAndIndex(id);
      if (found) {
        setActiveCard(found.card);
        setActiveStageId(found.stageId);
        return;
      }

      // It's a stage
      setActiveCard(null);
      setActiveStageId(id);
    },
    [findStageAndIndex]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !activeCard) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const activeInfo = findStageAndIndex(activeId);
      if (!activeInfo) return;

      // Check if over a card
      const overInfo = findStageAndIndex(overId);
      if (overInfo && activeInfo.stageId !== overInfo.stageId) {
        moveCard(activeInfo.stageId, overInfo.stageId, activeInfo.index, overInfo.index);
        return;
      }

      // Check if over a stage (empty drop zone)
      const overStage = stages.find((s) => s.id === overId);
      if (overStage && activeInfo.stageId !== overId) {
        moveCard(activeInfo.stageId, overId, activeInfo.index, overStage.cards.length);
      }
    },
    [activeCard, findStageAndIndex, moveCard, stages]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCard(null);
      setActiveStageId(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId === overId) return;

      // Card reorder within same stage
      const activeInfo = findStageAndIndex(activeId);
      const overInfo = findStageAndIndex(overId);
      if (activeInfo && overInfo && activeInfo.stageId === overInfo.stageId) {
        moveCard(activeInfo.stageId, activeInfo.stageId, activeInfo.index, overInfo.index);
        return;
      }

      // Stage reorder
      const activeStageIdx = stages.findIndex((s) => s.id === activeId);
      const overStageIdx = stages.findIndex((s) => s.id === overId);
      if (activeStageIdx !== -1 && overStageIdx !== -1) {
        reorderStages(activeStageIdx, overStageIdx);
      }
    },
    [findStageAndIndex, moveCard, reorderStages, stages]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.canvas}>
        <SortableContext
          items={stages.map((s) => s.id)}
          strategy={horizontalListSortingStrategy}
        >
          {stages.map((stage) => (
            <Stage key={stage.id} stage={stage} />
          ))}
        </SortableContext>

        <button
          className={styles.addStageBtn}
          onClick={addStage}
          id="add-stage-button"
        >
          <Plus size={24} />
          Add Stage
        </button>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div className={styles.dragOverlay}>
            <CardShell card={activeCard} stageId="" isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
