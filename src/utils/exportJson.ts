import type { Recipe } from '@app-types/recipe';
import { slugify } from './slugify';

export function serializeRecipe(meta: Recipe['meta'], stages: Recipe['stages']): Recipe {
  const id = slugify(meta.name || 'untitled');
  const now = new Date().toISOString();

  return {
    id,
    meta: {
      ...meta,
      updatedAt: now,
      createdAt: meta.createdAt || now,
    },
    stages,
  };
}

export function downloadRecipeJson(recipe: Recipe): void {
  const json = JSON.stringify(recipe, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${recipe.id}.json`;
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
