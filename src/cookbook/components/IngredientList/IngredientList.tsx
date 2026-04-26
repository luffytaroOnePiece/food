import type { Stage, IngredientCard } from '@app-types/recipe';
import styles from './IngredientList.module.css';

interface IngredientListProps {
  stages: Stage[];
  scaleIngredient: (quantity: number) => string;
}

export function IngredientList({ stages, scaleIngredient }: IngredientListProps) {
  // Collect all ingredients from all stages
  const ingredients = stages.flatMap((stage) =>
    stage.cards
      .filter((c): c is IngredientCard => c.type === 'ingredient')
      .map((card) => ({ ...card, stageName: stage.name }))
  );

  if (ingredients.length === 0) return null;

  return (
    <div className={styles.list}>
      <h3 className={styles.title}>Ingredients</h3>
      <ul className={styles.items}>
        {ingredients.map((ing) => (
          <li key={ing.id} className={styles.item}>
            <span className={styles.qty}>
              {scaleIngredient(ing.quantity)} {ing.unit}
            </span>
            <span className={styles.name}>{ing.name}</span>
            {ing.notes && <span className={styles.notes}>{ing.notes}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
