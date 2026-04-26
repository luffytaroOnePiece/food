import { useState } from 'react';
import { formatFraction } from '@utils/scaleIngredient';

export function useServingsScale(baseServings: number) {
  const [servings, setServings] = useState(baseServings);
  const scale = baseServings > 0 ? servings / baseServings : 1;

  const scaleIngredient = (quantity: number): string => {
    const scaled = quantity * scale;
    return formatFraction(scaled);
  };

  return { servings, setServings, scaleIngredient, scale };
}
