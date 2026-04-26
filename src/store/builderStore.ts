import { create } from 'zustand';
import type { RecipeMeta, Stage, CardType, AnyCard } from '@app-types/recipe';
import { createDefaultCard } from '@/constants/cards';
import { serializeRecipe, downloadRecipeJson } from '@utils/exportJson';

const DRAFT_KEY = 'recipe-builder-draft';

function createStageId(): string {
  return `stage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const defaultMeta: RecipeMeta = {
  name: '',
  description: '',
  cuisine: '',
  servings: 4,
  prepTime: 0,
  cookTime: 0,
  tags: [],
  icon: '🍽️',
  createdAt: '',
  updatedAt: '',
};

interface BuilderStore {
  meta: RecipeMeta;
  stages: Stage[];

  // Meta actions
  setMeta: (patch: Partial<RecipeMeta>) => void;

  // Stage actions
  addStage: () => void;
  renameStage: (stageId: string, name: string) => void;
  removeStage: (stageId: string) => void;
  reorderStages: (from: number, to: number) => void;

  // Card actions
  addCard: (stageId: string, type: CardType) => AnyCard;
  updateCard: (stageId: string, cardId: string, patch: Partial<AnyCard>) => void;
  removeCard: (stageId: string, cardId: string) => void;
  moveCard: (fromStage: string, toStage: string, fromIndex: number, toIndex: number) => void;

  // Persistence
  loadDraft: () => void;
  saveDraft: () => void;
  clearCanvas: () => void;

  // Export
  exportJSON: () => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  meta: { ...defaultMeta },
  stages: [
    { id: createStageId(), name: 'Prep', cards: [] },
  ],

  setMeta: (patch) =>
    set((state) => ({ meta: { ...state.meta, ...patch } })),

  addStage: () =>
    set((state) => ({
      stages: [
        ...state.stages,
        { id: createStageId(), name: `Stage ${state.stages.length + 1}`, cards: [] },
      ],
    })),

  renameStage: (stageId, name) =>
    set((state) => ({
      stages: state.stages.map((s) =>
        s.id === stageId ? { ...s, name } : s
      ),
    })),

  removeStage: (stageId) =>
    set((state) => ({
      stages: state.stages.filter((s) => s.id !== stageId),
    })),

  reorderStages: (from, to) =>
    set((state) => {
      const stages = [...state.stages];
      const [moved] = stages.splice(from, 1);
      stages.splice(to, 0, moved);
      return { stages };
    }),

  addCard: (stageId, type) => {
    const card = createDefaultCard(type);
    set((state) => ({
      stages: state.stages.map((s) =>
        s.id === stageId ? { ...s, cards: [...s.cards, card] } : s
      ),
    }));
    return card;
  },

  updateCard: (stageId, cardId, patch) =>
    set((state) => ({
      stages: state.stages.map((s) =>
        s.id === stageId
          ? {
              ...s,
              cards: s.cards.map((c) =>
                c.id === cardId ? ({ ...c, ...patch } as AnyCard) : c
              ),
            }
          : s
      ),
    })),

  removeCard: (stageId, cardId) =>
    set((state) => ({
      stages: state.stages.map((s) =>
        s.id === stageId
          ? { ...s, cards: s.cards.filter((c) => c.id !== cardId) }
          : s
      ),
    })),

  moveCard: (fromStage, toStage, fromIndex, toIndex) =>
    set((state) => {
      const stages = state.stages.map((s) => ({ ...s, cards: [...s.cards] }));
      const from = stages.find((s) => s.id === fromStage);
      const to = stages.find((s) => s.id === toStage);
      if (!from || !to) return state;

      const [card] = from.cards.splice(fromIndex, 1);
      to.cards.splice(toIndex, 0, card);
      return { stages };
    }),

  loadDraft: () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as { meta: RecipeMeta; stages: Stage[] };
      set({ meta: draft.meta, stages: draft.stages });
    } catch {
      // Ignore corrupted draft
    }
  },

  saveDraft: () => {
    const { meta, stages } = get();
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ meta, stages }));
    } catch {
      // Storage full — silently fail
    }
  },

  clearCanvas: () =>
    set({
      meta: { ...defaultMeta },
      stages: [{ id: createStageId(), name: 'Prep', cards: [] }],
    }),

  exportJSON: () => {
    const { meta, stages } = get();
    const recipe = serializeRecipe(meta, stages);
    downloadRecipeJson(recipe);
  },
}));
