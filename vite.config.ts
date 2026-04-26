import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import type { Plugin } from 'vite';

/**
 * Dev-only Vite plugin that exposes a POST endpoint to save recipe JSON
 * directly to public/recipes/ and regenerate the index manifest.
 */
function recipeSavePlugin(): Plugin {
  return {
    name: 'recipe-save',
    configureServer(server) {
      server.middlewares.use('/__save-recipe', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });

        req.on('end', () => {
          try {
            const recipe = JSON.parse(body);
            if (!recipe.id || !recipe.meta) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid recipe: missing id or meta' }));
              return;
            }

            const recipesDir = path.resolve(__dirname, 'public/recipes');

            // Ensure directory exists
            if (!fs.existsSync(recipesDir)) {
              fs.mkdirSync(recipesDir, { recursive: true });
            }

            // Write recipe JSON
            const filePath = path.join(recipesDir, `${recipe.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(recipe, null, 2));

            // Regenerate index.json
            try {
              execSync('node scripts/build-index.mjs', { cwd: __dirname });
            } catch (indexErr) {
              console.warn('⚠️  Failed to rebuild index.json:', indexErr);
            }

            console.log(`✅ Saved recipe: ${recipe.id}.json`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, id: recipe.id, path: filePath }));
          } catch (err) {
            console.error('❌ Failed to save recipe:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to save recipe' }));
          }
        });
      });

      // SOFT DELETE — move to .archived/
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/__delete-recipe\/([a-zA-Z0-9_-]+)$/);
        if (!match || req.method !== 'DELETE') { next(); return; }

        const recipeId = match[1];
        const recipesDir = path.resolve(__dirname, 'public/recipes');
        const archiveDir = path.join(recipesDir, '.archived');
        const filePath = path.join(recipesDir, `${recipeId}.json`);
        const archivePath = path.join(archiveDir, `${recipeId}.json`);

        try {
          if (!fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Recipe not found' }));
            return;
          }
          if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
          fs.renameSync(filePath, archivePath);

          try { execSync('node scripts/build-index.mjs', { cwd: __dirname }); } catch {}

          console.log(`📦 Archived recipe: ${recipeId}.json`);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, id: recipeId }));
        } catch (err) {
          console.error('❌ Failed to archive recipe:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to archive recipe' }));
        }
      });

      // RESTORE — move back from .archived/
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/__restore-recipe\/([a-zA-Z0-9_-]+)$/);
        if (!match || req.method !== 'POST') { next(); return; }

        const recipeId = match[1];
        const recipesDir = path.resolve(__dirname, 'public/recipes');
        const archiveDir = path.join(recipesDir, '.archived');
        const archivePath = path.join(archiveDir, `${recipeId}.json`);
        const filePath = path.join(recipesDir, `${recipeId}.json`);

        try {
          if (!fs.existsSync(archivePath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Archived recipe not found' }));
            return;
          }
          fs.renameSync(archivePath, filePath);

          try { execSync('node scripts/build-index.mjs', { cwd: __dirname }); } catch {}

          console.log(`♻️  Restored recipe: ${recipeId}.json`);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, id: recipeId }));
        } catch (err) {
          console.error('❌ Failed to restore recipe:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to restore recipe' }));
        }
      });

      // HARD DELETE — permanently remove from .archived/
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/__hard-delete-recipe\/([a-zA-Z0-9_-]+)$/);
        if (!match || req.method !== 'DELETE') { next(); return; }

        const recipeId = match[1];
        const archivePath = path.join(__dirname, 'public/recipes/.archived', `${recipeId}.json`);

        try {
          if (!fs.existsSync(archivePath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Archived recipe not found' }));
            return;
          }
          fs.unlinkSync(archivePath);
          console.log(`🗑️  Permanently deleted: ${recipeId}.json`);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, id: recipeId }));
        } catch (err) {
          console.error('❌ Failed to hard-delete recipe:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to hard-delete recipe' }));
        }
      });

      // LIST ARCHIVED recipes
      server.middlewares.use('/__archived-recipes', (_req, res) => {
        const archiveDir = path.resolve(__dirname, 'public/recipes/.archived');
        try {
          if (!fs.existsSync(archiveDir)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ recipes: [] }));
            return;
          }
          const files = fs.readdirSync(archiveDir).filter(f => f.endsWith('.json'));
          const recipes = files.map(f => {
            const raw = JSON.parse(fs.readFileSync(path.join(archiveDir, f), 'utf-8'));
            return { id: raw.id, name: raw.meta?.name, icon: raw.meta?.icon, cuisine: raw.meta?.cuisine };
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ recipes }));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to list archived recipes' }));
        }
      });

      // ADD ITEM to ingredients or cookware catalog
      server.middlewares.use('/__save-item', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { type, name, emoji } = JSON.parse(body);
            if (!type || !name) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing type or name' }));
              return;
            }

            const file = type === 'ingredient' ? 'ingredients.json' : 'cookware.json';
            const filePath = path.resolve(__dirname, 'public/data', file);
            const catalog = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            // Check if already exists (case-insensitive)
            const exists = catalog.items.some(
              (item: { name: string }) => item.name.toLowerCase() === name.toLowerCase()
            );
            if (!exists) {
              catalog.items.push({ name, emoji: emoji || '🍽️' });
              // Sort alphabetically
              catalog.items.sort((a: { name: string }, b: { name: string }) =>
                a.name.localeCompare(b.name)
              );
              fs.writeFileSync(filePath, JSON.stringify(catalog, null, 2));
              console.log(`➕ Added ${type}: ${emoji || '🍽️'} ${name}`);
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, name, emoji: emoji || '🍽️' }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to save item' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), recipeSavePlugin()],
  base: '/food/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app-types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@builder': path.resolve(__dirname, './src/builder'),
      '@cookbook': path.resolve(__dirname, './src/cookbook'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/@dnd-kit')) return 'dndkit';
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('node_modules/zustand')) return 'zustand';
        },
      },
    },
  },
});
