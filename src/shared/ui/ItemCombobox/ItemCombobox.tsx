import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styles from './ItemCombobox.module.css';

export interface CatalogItem {
  name: string;
  emoji: string;
}

interface ItemComboboxProps {
  /** 'ingredient' or 'cookware' — determines which catalog JSON to load */
  catalogType: 'ingredient' | 'cookware';
  /** Current value */
  value: string;
  /** Called when user selects or creates an item */
  onChange: (name: string, emoji: string) => void;
  /** Currently assigned emoji (for display) */
  emoji?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function ItemCombobox({
  catalogType,
  value,
  onChange,
  emoji,
  placeholder = 'Search…',
  autoFocus,
}: ItemComboboxProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [showCreate, setShowCreate] = useState(false);
  const [createEmoji, setCreateEmoji] = useState('🍽️');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load catalog
  useEffect(() => {
    const file = catalogType === 'ingredient' ? 'ingredients.json' : 'cookware.json';
    fetch(`/food/data/${file}`)
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {});
  }, [catalogType]);

  // Filter items
  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 20);
    const q = query.toLowerCase();
    return items
      .filter((item) => item.name.toLowerCase().includes(q))
      .slice(0, 15);
  }, [items, query]);

  // Check if exact match exists
  const exactMatch = useMemo(
    () => items.some((i) => i.name.toLowerCase() === query.trim().toLowerCase()),
    [items, query]
  );

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setShowCreate(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectItem = useCallback(
    (item: CatalogItem) => {
      setQuery(item.name);
      onChange(item.name, item.emoji);
      setOpen(false);
      setShowCreate(false);
    },
    [onChange]
  );

  const handleCreateNew = useCallback(async () => {
    const name = query.trim();
    if (!name) return;

    // Save to catalog file via dev server
    try {
      await fetch('/__save-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: catalogType, name, emoji: createEmoji }),
      });
    } catch {
      // Ignore — still use the item even if save fails
    }

    // Update local state
    const newItem = { name, emoji: createEmoji };
    setItems((prev) => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
    onChange(name, createEmoji);
    setOpen(false);
    setShowCreate(false);
  }, [query, createEmoji, catalogType, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < filtered.length) {
        selectItem(filtered[highlightIdx]);
      } else if (!exactMatch && query.trim()) {
        setShowCreate(true);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setShowCreate(false);
    }
  };

  const currentEmoji = emoji || items.find((i) => i.name.toLowerCase() === value.toLowerCase())?.emoji || '🍽️';

  return (
    <div className={styles.combobox}>
      <div className={styles.inputRow}>
        <span className={styles.emojiDisplay}>{currentEmoji}</span>
        <input
          ref={inputRef}
          className={styles.searchInput}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightIdx(-1);
            setShowCreate(false);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      </div>

      {open && (filtered.length > 0 || query.trim()) && (
        <div className={styles.dropdown} ref={dropdownRef}>
          {filtered.map((item, i) => (
            <button
              key={item.name}
              className={`${styles.dropdownItem} ${i === highlightIdx ? styles.highlighted : ''}`}
              onClick={() => selectItem(item)}
              onMouseEnter={() => setHighlightIdx(i)}
            >
              <span className={styles.itemEmoji}>{item.emoji}</span>
              <span className={styles.itemName}>{item.name}</span>
            </button>
          ))}

          {/* "Create new" option when no exact match */}
          {query.trim() && !exactMatch && !showCreate && (
            <button
              className={`${styles.dropdownItem} ${styles.createItem}`}
              onClick={() => setShowCreate(true)}
            >
              <span className={styles.itemEmoji}>➕</span>
              <span className={styles.itemName}>Create "{query.trim()}"</span>
            </button>
          )}

          {/* Create form with emoji picker */}
          {showCreate && (
            <div className={styles.createForm}>
              <input
                className={styles.emojiInput}
                value={createEmoji}
                onChange={(e) => setCreateEmoji(e.target.value)}
                placeholder="🍽️"
                maxLength={2}
                title="Paste or type an emoji"
              />
              <span style={{ flex: 1, fontSize: '0.8125rem', fontFamily: 'var(--font-ui)' }}>
                {query.trim()}
              </span>
              <button className={styles.createBtn} onClick={handleCreateNew}>
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
