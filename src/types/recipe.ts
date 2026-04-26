export type CardType = 'ingredient' | 'cookware' | 'step' | 'note' | 'video';

export interface BaseCard {
  id: string;
  type: CardType;
  tags?: string[];
}

export interface IngredientCard extends BaseCard {
  type: 'ingredient';
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  emoji?: string;
}

export interface CookwareCard extends BaseCard {
  type: 'cookware';
  name: string;
  detail?: string;
  emoji?: string;
}

export interface StepCard extends BaseCard {
  type: 'step';
  text: string;
  timerMinutes?: number;
}

export interface NoteCard extends BaseCard {
  type: 'note';
  text: string;
  color?: 'yellow' | 'green' | 'pink' | 'blue';
}

export interface VideoCard extends BaseCard {
  type: 'video';
  url: string;
  title?: string;
}

export type AnyCard = IngredientCard | CookwareCard | StepCard | NoteCard | VideoCard;

export interface Stage {
  id: string;
  name: string;
  cards: AnyCard[];
}

export interface RecipeMeta {
  name: string;
  description: string;
  cuisine: string;
  servings: number;
  prepTime: number;   // minutes
  cookTime: number;   // minutes
  tags: string[];
  icon: string;       // emoji
  coverImage?: string;
  createdAt: string;  // ISO
  updatedAt: string;  // ISO
}

export interface Recipe {
  id: string;         // slugified name
  meta: RecipeMeta;
  stages: Stage[];
}

export interface RecipeIndex {
  recipes: Array<{
    id: string;
    filename: string;
    name: string;
    cuisine: string;
    tags: string[];
    icon: string;
    prepTime: number;
    cookTime: number;
  }>;
}
