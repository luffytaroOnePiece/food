import type { CardType, IngredientCard, CookwareCard, StepCard, NoteCard, AnyCard } from '@app-types/recipe';

let cardCounter = 0;

function nextId(): string {
  cardCounter += 1;
  return `card-${Date.now()}-${cardCounter}`;
}

export function createDefaultCard(type: CardType): AnyCard {
  const id = nextId();

  switch (type) {
    case 'ingredient':
      return {
        id,
        type: 'ingredient',
        name: '',
        quantity: 0,
        unit: 'g',
      } satisfies IngredientCard;

    case 'cookware':
      return {
        id,
        type: 'cookware',
        name: '',
      } satisfies CookwareCard;

    case 'step':
      return {
        id,
        type: 'step',
        text: '',
      } satisfies StepCard;

    case 'note':
      return {
        id,
        type: 'note',
        text: '',
        color: 'yellow',
      } satisfies NoteCard;
  }
}

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  ingredient: 'Ingredient',
  cookware: 'Cookware',
  step: 'Step',
  note: 'Note',
};

export const CARD_TYPE_ICONS: Record<CardType, string> = {
  ingredient: '🧅',
  cookware: '🍳',
  step: '📋',
  note: '📝',
};

export const UNIT_OPTIONS = [
  'g', 'kg', 'ml', 'L', 'tsp', 'tbsp', 'cup', 'oz', 'lb',
  'pinch', 'whole', 'clove', 'bunch', 'slice', 'piece',
];
