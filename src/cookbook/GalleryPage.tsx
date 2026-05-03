import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Camera, Maximize2, X } from 'lucide-react';
import styles from './GalleryPage.module.css';

const IMAGE_START = 1;
const IMAGE_END = 4;
const BASE_URL =
  'https://raw.githubusercontent.com/luffytaroOnePiece/foodgallery/main';

function generateImages() {
  const imgs = [];
  for (let i = IMAGE_START; i <= IMAGE_END; i++) {
    imgs.push({ id: i, src: `${BASE_URL}/${i}.jpg`, alt: `Food photo ${i}` });
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
  const [images, setImages] = useState(() => shuffleArray(generateImages()));
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffleKeyRef = useRef(0);

  const handleShuffle = useCallback(() => {
    setIsShuffling(true);
    // Brief delay so the exit animation plays
    setTimeout(() => {
      shuffleKeyRef.current += 1;
      setImages(shuffleArray(generateImages()));
      setIsShuffling(false);
    }, 350);
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

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

      {/* Shuffle control */}
      <div className={styles.controls}>
        <button
          className={styles.shuffleBtn}
          onClick={handleShuffle}
          disabled={isShuffling}
          id="gallery-shuffle-btn"
        >
          <Shuffle size={16} className={isShuffling ? styles.spinning : ''} />
          Shuffle Photos
        </button>
        <span className={styles.photoCount}>
          <Camera size={14} />
          {images.length} photos
        </span>
      </div>

      {/* Gallery grid */}
      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {!isShuffling &&
            images.map((img, i) => (
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
            <motion.img
              src={`${BASE_URL}/${lightbox}.jpg`}
              alt={`Food photo ${lightbox}`}
              className={styles.lightboxImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
            />
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
