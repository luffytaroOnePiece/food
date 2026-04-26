import { useBuilderStore } from '@store/builderStore';
import { getYouTubeThumbnail, extractYouTubeId } from '@utils/youtube';
import type { VideoCard as VideoCardType } from '@app-types/recipe';
import styles from './cards.module.css';

interface ViewProps {
  card: VideoCardType;
}

export function VideoCardView({ card }: ViewProps) {
  const thumbnail = getYouTubeThumbnail(card.url);
  const hasValidUrl = !!extractYouTubeId(card.url);

  return (
    <>
      <span className={styles.cardIcon}>🎬</span>
      <div className={styles.cardInfo}>
        <div className={styles.cardTitle}>
          {card.title || (hasValidUrl ? 'YouTube Video' : 'No video set')}
        </div>
        {hasValidUrl && thumbnail && (
          <div className={styles.videoThumb}>
            <img
              src={thumbnail}
              alt={card.title || 'Video thumbnail'}
              width={120}
              height={68}
              style={{ borderRadius: '4px', objectFit: 'cover', marginTop: '4px' }}
            />
          </div>
        )}
        {!hasValidUrl && card.url && (
          <div className={styles.cardSubtitle} style={{ color: 'var(--color-terracotta)' }}>
            Invalid YouTube URL
          </div>
        )}
      </div>
    </>
  );
}

interface EditProps {
  card: VideoCardType;
  stageId: string;
}

export function VideoCardEdit({ card, stageId }: EditProps) {
  const updateCard = useBuilderStore((s) => s.updateCard);
  const hasValidUrl = !!extractYouTubeId(card.url);

  return (
    <div className={styles.editForm}>
      <div className={styles.editField}>
        <label className={styles.editLabel}>YouTube URL</label>
        <input
          className={styles.editInput}
          value={card.url}
          onChange={(e) => updateCard(stageId, card.id, { url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          autoFocus
        />
        {card.url && !hasValidUrl && (
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--color-terracotta)',
            marginTop: '2px',
          }}>
            Paste a valid YouTube link
          </span>
        )}
      </div>
      <div className={styles.editField}>
        <label className={styles.editLabel}>Title (optional)</label>
        <input
          className={styles.editInput}
          value={card.title || ''}
          onChange={(e) => updateCard(stageId, card.id, { title: e.target.value })}
          placeholder="e.g. How to fold an omelette"
        />
      </div>
    </div>
  );
}
