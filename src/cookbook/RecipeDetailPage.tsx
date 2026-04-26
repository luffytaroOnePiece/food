import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ChefHat, Printer } from 'lucide-react';
import { useRecipe } from '@hooks/useRecipes';
import { useServingsScale } from '@hooks/useServingsScale';
import { StageTimeline } from './components/StageTimeline/StageTimeline';
import { IngredientList } from './components/IngredientList/IngredientList';
import { ServingsAdjuster } from './components/ServingsAdjuster/ServingsAdjuster';
import { PrintView } from './components/PrintView/PrintView';
import { Badge } from '@shared/ui/Badge/Badge';
import { Button } from '@shared/ui/Button/Button';
import { Spinner } from '@shared/ui/Spinner/Spinner';

const s = {
  page: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 24px 64px',
  } as React.CSSProperties,
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    color: 'var(--color-ink-muted)',
    textDecoration: 'none',
    marginBottom: '32px',
  } as React.CSSProperties,
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  } as React.CSSProperties,
  icon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '12px',
  } as React.CSSProperties,
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.25rem',
    fontWeight: 700,
    color: 'var(--color-ink)',
    marginBottom: '8px',
  } as React.CSSProperties,
  desc: {
    fontFamily: 'var(--font-body)',
    fontSize: '1.125rem',
    color: 'var(--color-ink-muted)',
    fontStyle: 'italic',
    maxWidth: '520px',
    margin: '0 auto 16px',
  } as React.CSSProperties,
  metaRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    padding: '16px 0',
    borderTop: '1px solid rgba(44, 24, 16, 0.08)',
    borderBottom: '1px solid rgba(44, 24, 16, 0.08)',
    marginBottom: '24px',
  } as React.CSSProperties,
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    color: 'var(--color-ink-muted)',
  } as React.CSSProperties,
  tags: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  } as React.CSSProperties,
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '32px',
    padding: '16px 20px',
    background: 'rgba(251, 246, 236, 0.6)',
    borderRadius: 'var(--radius-stage)',
    border: '1px solid rgba(44, 24, 16, 0.06)',
  } as React.CSSProperties,
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '32px',
    alignItems: 'start',
  } as React.CSSProperties,
  sideCol: {} as React.CSSProperties,
  mainCol: {} as React.CSSProperties,
} as const;

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: recipe, isLoading, isError } = useRecipe(id ?? '');
  const { servings, setServings, scaleIngredient } = useServingsScale(
    recipe?.meta.servings ?? 4
  );

  if (isLoading) return <Spinner />;
  if (isError || !recipe) {
    return (
      <div style={{ ...s.page, textAlign: 'center' }}>
        <p>Recipe not found.</p>
        <Link to="/" style={s.backLink}>← Back to Cookbook</Link>
      </div>
    );
  }

  const totalTime = recipe.meta.prepTime + recipe.meta.cookTime;

  return (
    <motion.div
      style={s.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link to="/" style={s.backLink} className="no-print">
        <ArrowLeft size={14} />
        Back to Cookbook
      </Link>

      {/* Hero header */}
      <div style={s.header}>
        <span style={s.icon}>{recipe.meta.icon}</span>
        <h1 style={s.title}>{recipe.meta.name}</h1>
        {recipe.meta.description && <p style={s.desc}>{recipe.meta.description}</p>}

        <div style={s.metaRow}>
          <span style={s.metaItem}>
            <Clock size={16} style={{ color: 'var(--color-saffron)' }} />
            {totalTime}m total
          </span>
          <span style={s.metaItem}>
            <ChefHat size={16} style={{ color: 'var(--color-saffron)' }} />
            {recipe.meta.prepTime}m prep · {recipe.meta.cookTime}m cook
          </span>
          {recipe.meta.cuisine && (
            <span style={s.metaItem}>{recipe.meta.cuisine}</span>
          )}
        </div>

        {recipe.meta.tags.length > 0 && (
          <div style={s.tags}>
            {recipe.meta.tags.map((tag) => (
              <Badge key={tag} variant="saffron">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={s.toolbar} className="no-print">
        <ServingsAdjuster
          servings={servings}
          baseServings={recipe.meta.servings}
          onChange={setServings}
        />
        <Button variant="ghost" size="sm" onClick={() => window.print()}>
          <Printer size={14} />
          Print
        </Button>
      </div>

      {/* Two-column layout */}
      <div style={s.twoCol}>
        <div style={s.sideCol}>
          <IngredientList stages={recipe.stages} scaleIngredient={scaleIngredient} />
        </div>
        <div style={s.mainCol}>
          <StageTimeline stages={recipe.stages} scaleIngredient={scaleIngredient} />
        </div>
      </div>

      {/* Print-only view */}
      <PrintView recipe={recipe} scaleIngredient={scaleIngredient} />
    </motion.div>
  );
}
