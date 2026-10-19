import React from 'react';
import type { Card as CardType } from '../game/gameReducer';

interface CardProps {
  card: CardType;
  isMismatch: boolean;
  onFlip: () => void;
  difficultyLevel: number;
}

export const Card: React.FC<CardProps> = ({
  card,
  isMismatch,
  onFlip,
  difficultyLevel,
}) => {
  const isRevealed = card.flipped || card.matched;

  const handleClick = () => {
    if (!card.matched && !card.flipped) {
      onFlip();
    }
  };

  // Back-face pattern varies by difficulty
  const backPattern =
    difficultyLevel === 1
      ? 'repeating-linear-gradient(45deg,rgba(255,255,255,0.07) 0,rgba(255,255,255,0.07) 2px,transparent 0,transparent 50%)'
      : difficultyLevel === 2
      ? 'repeating-linear-gradient(45deg,rgba(255,255,255,0.14) 0,rgba(255,255,255,0.14) 2px,transparent 0,transparent 50%)'
      : undefined;

  const frontBg = card.matched
    ? 'bg-green-100 border-2 border-green-400 dark:bg-green-900/40 dark:border-green-500'
    : isMismatch
    ? 'bg-red-50 border-2 border-red-300 dark:bg-red-900/40 dark:border-red-500'
    : 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-600';

  return (
    <div
      className="card-scene aspect-square select-none"
      data-testid={`card-${card.id}`}
      aria-label={isRevealed ? `Card: ${card.symbol}` : 'Face-down card'}
      role="button"
      tabIndex={card.matched ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onClick={handleClick}
    >
      <div className={`card-inner${isRevealed ? ' flipped' : ''}${card.matched ? ' matched' : ''}`}>
        {/* Back face */}
        <div
          className="card-face card-back rounded-lg flex items-center justify-center cursor-pointer shadow-sm"
          style={{
            backgroundImage: backPattern,
            backgroundSize: difficultyLevel >= 1 ? (difficultyLevel === 2 ? '5px 5px' : '8px 8px') : undefined,
            backgroundColor: 'var(--primary)',
          }}
        >
          <span className="text-white text-xl font-bold opacity-70">?</span>
        </div>

        {/* Front face */}
        <div
          className={`card-face card-front rounded-lg flex items-center justify-center text-3xl shadow-md ${frontBg}`}
        >
          {card.symbol}
        </div>
      </div>
    </div>
  );
};
