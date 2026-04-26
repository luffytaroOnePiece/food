import { useQuery } from '@tanstack/react-query';
import type { RecipeIndex, Recipe } from '@app-types/recipe';

const BASE = import.meta.env.BASE_URL;

export function useRecipeIndex() {
  return useQuery<RecipeIndex>({
    queryKey: ['recipe-index'],
    queryFn: () => fetch(`${BASE}recipes/index.json`).then((r) => r.json()),
    staleTime: Infinity,
  });
}

export function useRecipe(id: string) {
  return useQuery<Recipe>({
    queryKey: ['recipe', id],
    queryFn: () => fetch(`${BASE}recipes/${id}.json`).then((r) => r.json()),
    staleTime: Infinity,
    enabled: !!id,
  });
}
