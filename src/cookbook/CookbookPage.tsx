import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRecipeIndex } from '@hooks/useRecipes';
import { RecipeCard } from './components/RecipeCard/RecipeCard';
import { SearchFilter } from './components/SearchFilter/SearchFilter';
import { Spinner } from '@shared/ui/Spinner/Spinner';

const pageStyles = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px',
  } as React.CSSProperties,
  hero: {
    textAlign: 'center',
    marginBottom: '48px',
  } as React.CSSProperties,
  heroIcon: {
    fontSize: '3.5rem',
    display: 'block',
    marginBottom: '12px',
  } as React.CSSProperties,
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.5rem',
    fontWeight: 700,
    color: 'var(--color-ink)',
    marginBottom: '8px',
  } as React.CSSProperties,
  heroSubtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '1.125rem',
    color: 'var(--color-ink-muted)',
    fontStyle: 'italic',
    maxWidth: '500px',
    margin: '0 auto',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '32px',
  } as React.CSSProperties,
  empty: {
    textAlign: 'center',
    padding: '64px 24px',
    color: 'var(--color-smoke)',
    fontFamily: 'var(--font-ui)',
    fontSize: '1rem',
  } as React.CSSProperties,
};

export default function CookbookPage() {
  const { data, isLoading } = useRecipeIndex();
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');

  const recipes = data?.recipes ?? [];

  const filtered = useMemo(() => {
    let result = recipes;
    if (cuisine) {
      result = result.filter((r) => r.cuisine === cuisine);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.cuisine.toLowerCase().includes(q)
      );
    }
    return result;
  }, [recipes, search, cuisine]);

  if (isLoading) return <Spinner />;

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.hero}>
        <span style={pageStyles.heroIcon}>📖</span>
        <h1 style={pageStyles.heroTitle}>The Cookbook</h1>
        <p style={pageStyles.heroSubtitle}>
          A curated collection of recipes, assembled with care and ready to cook.
        </p>
      </div>

      <SearchFilter
        recipes={recipes}
        search={search}
        onSearchChange={setSearch}
        activeCuisine={cuisine}
        onCuisineChange={setCuisine}
        resultCount={filtered.length}
      />

      {filtered.length > 0 ? (
        <div style={pageStyles.grid}>
          {filtered.map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <RecipeCard recipe={recipe} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={pageStyles.empty}>
          No recipes found. Try a different search or filter.
        </div>
      )}
    </div>
  );
}
