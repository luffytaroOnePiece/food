import { useState, type KeyboardEvent } from 'react';
import { useBuilderStore } from '@store/builderStore';
import { GalleryPicker } from './GalleryPicker';
import styles from './MetaPanel.module.css';

export function MetaPanel() {
  const meta = useBuilderStore((s) => s.meta);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const [tagInput, setTagInput] = useState('');

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !meta.tags.includes(tag)) {
        setMeta({ tags: [...meta.tags, tag] });
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && tagInput === '' && meta.tags.length > 0) {
      setMeta({ tags: meta.tags.slice(0, -1) });
    }
  };

  const removeTag = (tag: string) => {
    setMeta({ tags: meta.tags.filter((t) => t !== tag) });
  };

  return (
    <aside className={styles.metaPanel}>
      {/* Recipe Identity */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Recipe Details</h3>

        <div className={styles.iconPicker}>
          <div className={styles.iconPreview}>{meta.icon || '🍽️'}</div>
          <input
            className={styles.iconInput}
            value={meta.icon}
            onChange={(e) => setMeta({ icon: e.target.value })}
            placeholder="🍽️"
            maxLength={2}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Recipe Name</label>
          <input
            className={styles.input}
            value={meta.name}
            onChange={(e) => setMeta({ name: e.target.value })}
            placeholder="e.g. Spaghetti Carbonara"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={meta.description}
            onChange={(e) => setMeta({ description: e.target.value })}
            placeholder="A short description of this recipe…"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Cuisine</label>
          <input
            className={styles.input}
            value={meta.cuisine}
            onChange={(e) => setMeta({ cuisine: e.target.value })}
            placeholder="e.g. Italian"
          />
        </div>
      </div>

      {/* Timing */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Timing & Servings</h3>

        <div className={styles.field}>
          <label className={styles.label}>Servings</label>
          <input
            className={styles.input}
            type="number"
            value={meta.servings || ''}
            onChange={(e) => setMeta({ servings: parseInt(e.target.value) || 0 })}
            min={1}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Prep (min)</label>
            <input
              className={styles.input}
              type="number"
              value={meta.prepTime || ''}
              onChange={(e) => setMeta({ prepTime: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Cook (min)</label>
            <input
              className={styles.input}
              type="number"
              value={meta.cookTime || ''}
              onChange={(e) => setMeta({ cookTime: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Tags</h3>
        <div className={styles.tagsInput}>
          {meta.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
              <button
                className={styles.tagRemove}
                onClick={() => removeTag(tag)}
                type="button"
              >
                ×
              </button>
            </span>
          ))}
          <input
            className={styles.tagInput}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={meta.tags.length === 0 ? 'Type and press Enter…' : ''}
          />
        </div>
      </div>

      {/* Featured Photos */}
      <GalleryPicker />
    </aside>
  );
}
