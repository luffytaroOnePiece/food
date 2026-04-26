import { Link } from 'react-router-dom';
import { Clock, ChefHat, ArrowRight, Trash2 } from 'lucide-react';
import { Badge } from '@shared/ui/Badge/Badge';
import type { RecipeIndex } from '@app-types/recipe';
import styles from './RecipeCard.module.css';

const isDev = import.meta.env.DEV;

interface RecipeCardProps {
  recipe: RecipeIndex['recipes'][number];
  onDelete?: (id: string) => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm(
      `Delete "${recipe.name}"? This will remove the recipe file permanently.`
    );
    if (confirmed) {
      onDelete?.(recipe.id);
    }
  };

  return (
    <Link to={`/recipe/${recipe.id}`} className={styles.card} id={`recipe-card-${recipe.id}`}>
      {isDev && onDelete && (
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          title="Delete recipe"
        >
          <Trash2 size={14} />
        </button>
      )}

      <div className={styles.cardHeader}>
        <span className={styles.icon}>{recipe.icon}</span>
        <h3 className={styles.name}>{recipe.name}</h3>
        <span className={styles.cuisine}>{recipe.cuisine}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.timings}>
          <span className={styles.timing}>
            <Clock size={14} />
            {totalTime}m total
          </span>
          <span className={styles.timing}>
            <ChefHat size={14} />
            {recipe.prepTime}m prep
          </span>
        </div>

        {recipe.tags.length > 0 && (
          <div className={styles.tags}>
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="saffron">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        View Recipe
        <ArrowRight size={14} />
      </div>
    </Link>
  );
}
