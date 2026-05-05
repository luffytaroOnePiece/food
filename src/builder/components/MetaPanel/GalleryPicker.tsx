import { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '@store/builderStore';
import { ImageIcon, Check } from 'lucide-react';
import styles from './GalleryPicker.module.css';

const BASE_URL =
  'https://raw.githubusercontent.com/luffytaroOnePiece/foodgallery/main';

type Metadata = Record<string, string>;

export function GalleryPicker() {
  const meta = useBuilderStore((s) => s.meta);
  const setMeta = useBuilderStore((s) => s.setMeta);
  const selected = meta.galleryImages ?? [];

  const [gallery, setGallery] = useState<{ id: number; caption: string }[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    fetch(`${import.meta.env.BASE_URL}foodmetadata.json`)
      .then((r) => r.json())
      .then((data: Metadata) => {
        const items = Object.keys(data)
          .map(Number)
          .filter((n) => !isNaN(n))
          .sort((a, b) => a - b)
          .map((id) => ({ id, caption: data[String(id)] }));
        setGallery(items);
      })
      .catch(() => {});
  }, []);

  const toggle = (id: number) => {
    if (selected.includes(id)) {
      setMeta({ galleryImages: selected.filter((n) => n !== id) });
    } else {
      setMeta({ galleryImages: [...selected, id] });
    }
  };

  if (gallery.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <ImageIcon size={14} />
        Featured Photos
      </h3>
      <p className={styles.hint}>Select photos to feature with this recipe</p>
      <div className={styles.grid}>
        {gallery.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              className={`${styles.thumb} ${isSelected ? styles.thumbSelected : ''}`}
              onClick={() => toggle(item.id)}
              type="button"
              title={item.caption}
            >
              <img
                src={`${BASE_URL}/${item.id}.jpg`}
                alt={item.caption}
                className={styles.thumbImg}
                loading="lazy"
                draggable={false}
              />
              {isSelected && (
                <span className={styles.checkBadge}>
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <span className={styles.thumbCaption}>{item.caption}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <span className={styles.count}>
          {selected.length} photo{selected.length !== 1 ? 's' : ''} selected
        </span>
      )}
    </div>
  );
}
