import { Search } from 'lucide-react';
import type { RecipeIndex } from '@app-types/recipe';
import styles from './SearchFilter.module.css';

interface SearchFilterProps {
  recipes: RecipeIndex['recipes'];
  search: string;
  onSearchChange: (value: string) => void;
  activeCuisine: string;
  onCuisineChange: (cuisine: string) => void;
  resultCount: number;
}

export function SearchFilter({
  recipes,
  search,
  onSearchChange,
  activeCuisine,
  onCuisineChange,
  resultCount,
}: SearchFilterProps) {
  // Extract unique cuisines
  const cuisines = [...new Set(recipes.map((r) => r.cuisine).filter(Boolean))].sort();

  return (
    <div className={styles.searchFilter}>
      <div className={styles.searchBox}>
        <Search size={16} />
        <input
          className={styles.searchInput}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search recipes…"
          id="recipe-search-input"
        />
      </div>

      {cuisines.length > 0 && (
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Cuisine:</span>
          <button
            className={`${styles.filterChip} ${activeCuisine === '' ? styles.active : ''}`}
            onClick={() => onCuisineChange('')}
          >
            All
          </button>
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              className={`${styles.filterChip} ${activeCuisine === cuisine ? styles.active : ''}`}
              onClick={() => onCuisineChange(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
      )}

      <span className={styles.resultCount}>
        {resultCount} recipe{resultCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
