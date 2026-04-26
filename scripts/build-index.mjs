import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const recipesDir = resolve(__dirname, '../public/recipes');

const files = readdirSync(recipesDir).filter(
  f => f.endsWith('.json') && f !== 'index.json'
);

const recipes = files.map(filename => {
  const raw = JSON.parse(readFileSync(resolve(recipesDir, filename), 'utf-8'));
  return {
    id: raw.id,
    filename,
    name: raw.meta.name,
    cuisine: raw.meta.cuisine,
    tags: raw.meta.tags,
    icon: raw.meta.icon,
    prepTime: raw.meta.prepTime,
    cookTime: raw.meta.cookTime,
  };
});

writeFileSync(
  resolve(recipesDir, 'index.json'),
  JSON.stringify({ recipes }, null, 2)
);

console.log(`✅ Built index.json with ${recipes.length} recipes`);
