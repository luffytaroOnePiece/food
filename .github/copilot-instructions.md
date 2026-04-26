# GitHub Copilot Instructions — Recipe Builder & Cookbook

## Project Overview
A React 18 + Vite + TypeScript application with two modes:
- **Builder** (local-only, `import.meta.env.DEV === true`): drag-and-drop recipe canvas
- **Cookbook** (production): static cookbook rendered from JSON files in `/public/recipes/`

Deployed as a static site to GitHub Pages. Routing is hash-based (`createHashRouter`).

## Architecture Rules

### File Organisation
- Feature code lives in `src/builder/` or `src/cookbook/`
- Shared UI components go in `src/shared/ui/`
- Types are in `src/types/recipe.ts` — never redeclare inline
- All path aliases are defined in `vite.config.ts` (e.g. `@builder`, `@cookbook`, `@shared`)

### State Management
- Builder state: **Zustand** store at `src/store/builderStore.ts`
- Cookbook data: **React Query** (`@tanstack/react-query`) via hooks in `src/hooks/`
- No Redux, no Context API for data — use Zustand or React Query
- Local draft persisted to `localStorage` key `recipe-builder-draft`

### Styling
- Use CSS custom properties from `src/shared/styles/tokens.css`
- CSS Modules for component-level styles
- Do not use Tailwind, styled-components, or Emotion

### Environment Gate
- Check `import.meta.env.DEV` for builder availability
- In production, `/builder` route redirects to `/`
