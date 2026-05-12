import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Camera, Maximize2, X, Search } from "lucide-react";
import styles from "./GalleryPage.module.css";

const BASE_URL =
  "https://raw.githubusercontent.com/luffytaroOnePiece/foodgallery/main";

type Metadata = Record<string, string>;

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  caption: string;
  orientation: 'horizontal' | 'vertical' | 'square';
}

async function buildImages(meta: Metadata): Promise<GalleryImage[]> {
  // Derive image list from metadata keys — no hardcoded range needed
  const ids = Object.keys(meta)
    .map(Number)
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const promises = ids.map((id) => {
    return new Promise<GalleryImage>((resolve) => {
      const src = `${BASE_URL}/${id}.jpg`;
      const img = new Image();
      img.onload = () => {
        let orientation: 'horizontal' | 'vertical' | 'square' = 'square';
        if (img.naturalWidth > img.naturalHeight) orientation = 'horizontal';
        else if (img.naturalHeight > img.naturalWidth) orientation = 'vertical';
        resolve({
          id,
          src,
          alt: meta[String(id)],
          caption: meta[String(id)],
          orientation,
        });
      };
      img.onerror = () => {
        resolve({
          id,
          src,
          alt: meta[String(id)],
          caption: meta[String(id)],
          orientation: 'horizontal',
        });
      };
      img.src = src;
    });
  });

  return Promise.all(promises);
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
  const [search, setSearch] = useState("");
  const [orientationFilter, setOrientationFilter] = useState<'all' | 'vertical' | 'horizontal'>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffleKeyRef = useRef(0);
  const metaLoaded = useRef(false);

  // Load metadata once
  useEffect(() => {
    if (metaLoaded.current) return;
    metaLoaded.current = true;

    async function load() {
      try {
        const r = await fetch(`${import.meta.env.BASE_URL}foodmetadata.json`);
        const data = await r.json();
        setMetadata(data);
        const imgs = await buildImages(data);
        setImages(shuffleArray(imgs));
      } catch {
        const fallback: Metadata = {};
        setMetadata(fallback);
        const imgs = await buildImages(fallback);
        setImages(shuffleArray(imgs));
      }
    }
    load();
  }, []);

  const handleShuffle = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      shuffleKeyRef.current += 1;
      setImages(prev => shuffleArray([...prev]));
      setIsShuffling(false);
    }, 350);
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Filter images by search query and orientation
  const filtered = useMemo(() => {
    let result = images;
    if (orientationFilter !== 'all') {
      result = result.filter((img) => img.orientation === orientationFilter);
    }
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter((img) => img.caption.toLowerCase().includes(q));
  }, [images, search, orientationFilter]);

  // Find the lightbox image caption
  const lightboxImage = images.find((img) => img.id === lightbox);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <span className={styles.heroIcon}>📸</span>
        <h1 className={styles.heroTitle}>Food Gallery</h1>
        <p className={styles.heroSubtitle}>
          A visual feast — our favourite dishes captured in their delicious
          glory.
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

        <div className={styles.filterWrap}>
          <button
            className={`${styles.filterBtn} ${orientationFilter === 'all' ? styles.active : ''}`}
            onClick={() => setOrientationFilter('all')}
          >All</button>
          <button
            className={`${styles.filterBtn} ${orientationFilter === 'horizontal' ? styles.active : ''}`}
            onClick={() => setOrientationFilter('horizontal')}
          >Horizontal</button>
          <button
            className={`${styles.filterBtn} ${orientationFilter === 'vertical' ? styles.active : ''}`}
            onClick={() => setOrientationFilter('vertical')}
          >Vertical</button>
        </div>

        <button
          className={styles.shuffleBtn}
          onClick={handleShuffle}
          disabled={isShuffling || images.length === 0}
          id="gallery-shuffle-btn"
        >
          <Shuffle size={16} className={isShuffling ? styles.spinning : ""} />
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
