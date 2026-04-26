import { Timer } from 'lucide-react';
import { CARD_TYPE_LABELS, CARD_TYPE_ICONS } from '@/constants/cards';
import { getYouTubeEmbedUrl } from '@utils/youtube';
import type { Stage } from '@app-types/recipe';
import styles from './StageTimeline.module.css';

interface StageTimelineProps {
  stages: Stage[];
  scaleIngredient?: (quantity: number) => string;
}

export function StageTimeline({ stages, scaleIngredient }: StageTimelineProps) {
  const scale = scaleIngredient ?? ((q: number) => String(q));

  return (
    <div className={styles.timeline}>
      {stages.map((stage) => (
        <div key={stage.id} className={styles.stageBlock}>
          <div className={styles.stageHeader}>
            <div className={styles.stageDot} />
            <h3 className={styles.stageName}>{stage.name}</h3>
          </div>

          <div className={styles.stageCards}>
            {stage.cards.map((card) => {
              const noteColorClass =
                card.type === 'note' && card.color
                  ? styles[`note${card.color.charAt(0).toUpperCase() + card.color.slice(1)}`]
                  : '';
              const isNote = card.type === 'note';

              return (
                <div
                  key={card.id}
                  className={`${styles.timelineCard} ${isNote ? styles.noteCard : ''} ${noteColorClass}`}
                >
                  <div className={styles.cardTypeLabel}>
                    <span>
                      {(card.type === 'ingredient' || card.type === 'cookware') && card.emoji
                        ? card.emoji
                        : CARD_TYPE_ICONS[card.type]}
                    </span>
                    {CARD_TYPE_LABELS[card.type]}
                  </div>

                  {card.type === 'ingredient' && (
                    <div className={styles.cardText}>
                      <span className={styles.ingredientQty}>
                        {scale(card.quantity)} {card.unit}
                      </span>{' '}
                      {card.name}
                      {card.notes && (
                        <div className={styles.cardDetail}>{card.notes}</div>
                      )}
                    </div>
                  )}

                  {card.type === 'cookware' && (
                    <div className={styles.cardText}>
                      {card.name}
                      {card.detail && (
                        <div className={styles.cardDetail}>{card.detail}</div>
                      )}
                    </div>
                  )}

                  {card.type === 'step' && (
                    <div className={styles.cardText}>
                      {card.text}
                      {card.timerMinutes && card.timerMinutes > 0 && (
                        <span className={styles.timerInline}>
                          <Timer size={10} />
                          {card.timerMinutes}m
                        </span>
                      )}
                    </div>
                  )}

                  {card.type === 'note' && (
                    <div className={styles.cardText}>{card.text}</div>
                  )}

                  {card.type === 'video' && (() => {
                    const embedUrl = getYouTubeEmbedUrl(card.url);
                    return embedUrl ? (
                      <div className={styles.videoEmbed}>
                        {card.title && (
                          <div className={styles.cardText} style={{ marginBottom: '8px', fontWeight: 600 }}>
                            {card.title}
                          </div>
                        )}
                        <div className={styles.videoWrapper}>
                          <iframe
                            src={embedUrl}
                            title={card.title || 'YouTube video'}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={styles.cardText} style={{ color: 'var(--color-smoke)', fontStyle: 'italic' }}>
                        Video link not set
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
