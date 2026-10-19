import React from 'react';
import { Card } from './Card';
import type { GameState } from '../game/gameReducer';

interface BoardProps {
  state: GameState;
  onFlip: (index: number) => void;
}

export const Board: React.FC<BoardProps> = ({ state, onFlip }) => {
  const { cards, flippedIndices, phase, difficultyLevel } = state;

  // Determine mismatch cards for visual feedback
  const isMismatchPending =
    phase === 'CHECKING_MATCH' &&
    flippedIndices.length === 2 &&
    cards[flippedIndices[0]].symbol !== cards[flippedIndices[1]].symbol;

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-3"
      aria-label="Memory match game board"
      data-testid="game-board"
    >
      {cards.map((card, idx) => (
        <Card
          key={card.id}
          card={card}
          isMismatch={isMismatchPending && flippedIndices.includes(idx)}
          onFlip={() => onFlip(idx)}
          difficultyLevel={difficultyLevel}
        />
      ))}
    </div>
  );
};
