import type { Recipe } from '@app-types/recipe';
import styles from './PrintView.module.css';

interface PrintViewProps {
  recipe: Recipe;
  scaleIngredient: (quantity: number) => string;
}

export function PrintView({ recipe, scaleIngredient }: PrintViewProps) {
  return (
    <div className={styles.printView}>
      <h1 className={styles.title}>{recipe.meta.icon} {recipe.meta.name}</h1>
      <p className={styles.desc}>{recipe.meta.description}</p>
      <div className={styles.meta}>
        <span>Cuisine: {recipe.meta.cuisine}</span>
        <span>Servings: {recipe.meta.servings}</span>
        <span>Prep: {recipe.meta.prepTime}m</span>
        <span>Cook: {recipe.meta.cookTime}m</span>
      </div>
      {recipe.stages.map((stage) => (
        <div key={stage.id} className={styles.stage}>
          <h2 className={styles.stageName}>{stage.name}</h2>
          {stage.cards.map((card) => (
            <div key={card.id} className={styles.card}>
              {card.type === 'ingredient' && (
                <p><strong>{scaleIngredient(card.quantity)} {card.unit}</strong> {card.name}{card.notes ? ` (${card.notes})` : ''}</p>
              )}
              {card.type === 'cookware' && <p>🍳 {card.name}{card.detail ? ` — ${card.detail}` : ''}</p>}
              {card.type === 'step' && <p>{card.text}{card.timerMinutes ? ` [${card.timerMinutes}m]` : ''}</p>}
              {card.type === 'note' && <p><em>💡 {card.text}</em></p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
