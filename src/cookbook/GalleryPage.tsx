import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Camera, Maximize2, X, Search } from 'lucide-react';
import styles from './GalleryPage.module.css';

const IMAGE_START = 1;
const IMAGE_END = 4;
const BASE_URL =
  'https://raw.githubusercontent.com/luffytaroOnePiece/foodgallery/main';

type Metadata = Record<string, string>;

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

function buildImages(meta: Metadata): GalleryImage[] {
  const imgs: GalleryImage[] = [];
  for (let i = IMAGE_START; i <= IMAGE_END; i++) {
    const caption = meta[String(i)] ?? `Dish #${i}`;
    imgs.push({
      id: i,
      src: `${BASE_URL}/${i}.jpg`,
      alt: caption,
      caption,
    });
  }
  return imgs;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function GalleryPage() {
  const [metadata, setMetadata] = useState<Metadata>({});
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [search, setSearch] = useState('');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffleKeyRef = useRef(0);
  const metaLoaded = useRef(false);

  // Load metadata once
  useEffect(() => {
    if (metaLoaded.current) return;
    metaLoaded.current = true;

    fetch(`${import.meta.env.BASE_URL}foodmetadata.json`)
      .then((r) => r.json())
      .then((data: Metadata) => {
        setMetadata(data);
        setImages(shuffleArray(buildImages(data)));
      })
      .catch(() => {
        // Fallback: no captions
        const fallback: Metadata = {};
        setMetadata(fallback);
        setImages(shuffleArray(buildImages(fallback)));
      });
  }, []);

  const handleShuffle = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      shuffleKeyRef.current += 1;
      setImages(shuffleArray(buildImages(metadata)));
      setIsShuffling(false);
    }, 350);
  }, [metadata]);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Filter images by search query
  const filtered = useMemo(() => {
    if (!search.trim()) return images;
    const q = search.toLowerCase();
    return images.filter((img) => img.caption.toLowerCase().includes(q));
  }, [images, search]);

  // Find the lightbox image caption
  const lightboxImage = images.find((img) => img.id === lightbox);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <span className={styles.heroIcon}>📸</span>
        <h1 className={styles.heroTitle}>Food Gallery</h1>
        <p className={styles.heroSubtitle}>
          A visual feast — our favourite dishes captured in their delicious glory.
        </p>
      </div>

      {/* Search & Shuffle controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="gallery-search"
          />
        </div>

        <button
          className={styles.shuffleBtn}
          onClick={handleShuffle}
          disabled={isShuffling || images.length === 0}
          id="gallery-shuffle-btn"
        >
          <Shuffle size={16} className={isShuffling ? styles.spinning : ''} />
          Shuffle Photos
        </button>
        <span className={styles.photoCount}>
          <Camera size={14} />
          {filtered.length} of {images.length} photos
        </span>
      </div>

      {/* Gallery grid */}
      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {!isShuffling &&
            filtered.map((img, i) => (
              <motion.div
                key={`${shuffleKeyRef.current}-${img.id}`}
                className={styles.card}
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.45,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                layout
                onClick={() => setLightbox(img.id)}
              >
                <div className={styles.imageWrap}>
                  <img
                    src={img.src}
                    alt={img.alt}
                    className={styles.image}
                    loading="lazy"
                    draggable={false}
                  />
                  <div className={styles.overlay}>
                    <Maximize2 size={20} />
                  </div>
                </div>
                <div className={styles.cardLabel}>
                  <span className={styles.cardCaption}>{img.caption}</span>
                  <span className={styles.cardNumber}>#{img.id}</span>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`${BASE_URL}/${lightbox}.jpg`}
                alt={lightboxImage?.caption ?? `Food photo ${lightbox}`}
                className={styles.lightboxImage}
              />
              {lightboxImage?.caption && (
                <div className={styles.lightboxCaption}>
                  {lightboxImage.caption}
                </div>
              )}
            </motion.div>
            <button
              className={styles.lightboxClose}
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
            >
              <X size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
