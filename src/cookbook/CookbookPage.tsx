import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, RotateCcw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecipeIndex } from '@hooks/useRecipes';
import { RecipeCard } from './components/RecipeCard/RecipeCard';
import { SearchFilter } from './components/SearchFilter/SearchFilter';
import { Spinner } from '@shared/ui/Spinner/Spinner';
import { Button } from '@shared/ui/Button/Button';

const isDev = import.meta.env.DEV;

interface ArchivedRecipe {
  id: string;
  name: string;
  icon: string;
  cuisine: string;
}

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
  archiveSection: {
    marginTop: '48px',
    borderTop: '1px dashed rgba(44, 24, 16, 0.12)',
    paddingTop: '24px',
  } as React.CSSProperties,
  archiveHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
    fontFamily: 'var(--font-display)',
    fontSize: '1.125rem',
    fontWeight: 700,
    color: 'var(--color-smoke)',
    marginBottom: '16px',
  } as React.CSSProperties,
  archiveItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(44, 24, 16, 0.03)',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid rgba(44, 24, 16, 0.06)',
  } as React.CSSProperties,
  archiveInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
  archiveIcon: {
    fontSize: '1.5rem',
  } as React.CSSProperties,
  archiveName: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    color: 'var(--color-ink)',
    fontWeight: 600,
  } as React.CSSProperties,
  archiveCuisine: {
    fontFamily: 'var(--font-ui)',
    fontSize: '0.75rem',
    color: 'var(--color-smoke)',
    marginLeft: '8px',
  } as React.CSSProperties,
  archiveActions: {
    display: 'flex',
    gap: '6px',
  } as React.CSSProperties,
};

export default function CookbookPage() {
  const { data, isLoading } = useRecipeIndex();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [archived, setArchived] = useState<ArchivedRecipe[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  const recipes = data?.recipes ?? [];

  // Fetch archived recipes (dev only)
  const fetchArchived = useCallback(async () => {
    if (!isDev) return;
    try {
      const res = await fetch('/__archived-recipes');
      const data = await res.json();
      setArchived(data.recipes ?? []);
    } catch {
      // Ignore in production
    }
  }, []);

  useEffect(() => {
    fetchArchived();
  }, [fetchArchived]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/__delete-recipe/${id}`, { method: 'DELETE' });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['recipe-index'] });
        fetchArchived(); // Refresh trash
      } else {
        alert('Failed to archive recipe.');
      }
    } catch {
      alert('Could not connect to dev server.');
    }
  }, [queryClient, fetchArchived]);

  const handleRestore = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/__restore-recipe/${id}`, { method: 'POST' });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['recipe-index'] });
        fetchArchived();
      } else {
        alert('Failed to restore recipe.');
      }
    } catch {
      alert('Could not connect to dev server.');
    }
  }, [queryClient, fetchArchived]);

  const handleHardDelete = useCallback(async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Permanently delete "${name}"? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/__hard-delete-recipe/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchArchived();
      } else {
        alert('Failed to permanently delete recipe.');
      }
    } catch {
      alert('Could not connect to dev server.');
    }
  }, [fetchArchived]);

  const filtered = useMemo(() => {
    let result = recipes;
    if (cuisine) {
      result = result.filter((r) => r.cuisine?.trim() === cuisine);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.cuisine?.trim().toLowerCase().includes(q)
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
              <RecipeCard recipe={recipe} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={pageStyles.empty}>
          No recipes found. Try a different search or filter.
        </div>
      )}

      {/* Archived / Trash section — dev mode only */}
      {isDev && archived.length > 0 && (
        <div style={pageStyles.archiveSection}>
          <div
            style={pageStyles.archiveHeader}
            onClick={() => setShowArchive(!showArchive)}
          >
            <Archive size={18} />
            Trash ({archived.length})
            {showArchive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          <AnimatePresence>
            {showArchive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                {archived.map((recipe) => (
                  <div key={recipe.id} style={pageStyles.archiveItem}>
                    <div style={pageStyles.archiveInfo}>
                      <span style={pageStyles.archiveIcon}>{recipe.icon || '🍽️'}</span>
                      <span style={pageStyles.archiveName}>{recipe.name}</span>
                      {recipe.cuisine && (
                        <span style={pageStyles.archiveCuisine}>{recipe.cuisine}</span>
                      )}
                    </div>
                    <div style={pageStyles.archiveActions}>
                      <Button variant="ghost" size="sm" onClick={() => handleRestore(recipe.id)}>
                        <RotateCcw size={13} />
                        Restore
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleHardDelete(recipe.id, recipe.name)}
                      >
                        <Trash2 size={13} />
                        Delete Forever
                      </Button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
