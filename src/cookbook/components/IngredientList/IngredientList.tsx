import type { Stage, IngredientCard, CookwareCard } from '@app-types/recipe';
import styles from './IngredientList.module.css';

interface IngredientListProps {
  stages: Stage[];
  scaleIngredient?: (quantity: number) => string;
}

export function IngredientList({ stages }: IngredientListProps) {
  const ingredients = stages.flatMap((stage) =>
    stage.cards
      .filter((c): c is IngredientCard => c.type === 'ingredient')
  );

  const cookware = stages.flatMap((stage) =>
    stage.cards
      .filter((c): c is CookwareCard => c.type === 'cookware')
  );

  // Deduplicate by name
  const uniqueIngredients = [...new Map(ingredients.map(i => [i.name, i])).values()];
  const uniqueCookware = [...new Map(cookware.map(c => [c.name, c])).values()];

  if (uniqueIngredients.length === 0 && uniqueCookware.length === 0) return null;

  return (
    <div className={styles.list}>
      <h3 className={styles.title}>Materials</h3>
      <div className={styles.items}>
        {uniqueIngredients.map((ing) => (
          <span key={ing.id} className={styles.chip}>
            <span className={styles.chipEmoji}>{ing.emoji || '🧅'}</span>
            {ing.name}
          </span>
        ))}
        {uniqueCookware.map((cw) => (
          <span key={cw.id} className={styles.chip}>
            <span className={styles.chipEmoji}>{cw.emoji || '🍳'}</span>
            {cw.name}
          </span>
        ))}
      </div>
    </div>
  );
}
