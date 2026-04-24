import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  suit?: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank?: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  animated?: boolean;
  dealAnimation?: boolean;
}

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black',
  spades: 'text-black',
};

export function PlayingCard({
  suit,
  rank,
  faceDown = false,
  onClick,
  className,
  selected = false,
  animated = false,
  dealAnimation = false,
}: PlayingCardProps) {
  const cardContent = (
    <div className={cn(
      'w-24 h-36 rounded-lg border-2 flex items-center justify-center relative font-bold cursor-pointer transition-all',
      faceDown
        ? 'bg-gradient-to-br from-primary to-accent border-accent/50 shadow-lg shadow-accent/30'
        : 'bg-white border-gray-800',
      selected && 'ring-2 ring-accent scale-105',
      className
    )}>
      {faceDown ? (
        <div className="text-center">
          <div className="text-3xl text-foreground animate-pulse">🎴</div>
        </div>
      ) : (
        <>
          {/* Corner decorations */}
          <div className="absolute top-1 left-1 text-center">
            <div className={cn('text-lg font-bold', SUIT_COLORS[suit || 'hearts'])}>
              {rank}
            </div>
            <div className={cn('text-sm', SUIT_COLORS[suit || 'hearts'])}>
              {SUIT_SYMBOLS[suit || 'hearts']}
            </div>
          </div>

          {/* Center symbol */}
          <div className="flex flex-col items-center gap-1">
            <div className={cn('text-4xl', SUIT_COLORS[suit || 'hearts'])}>
              {SUIT_SYMBOLS[suit || 'hearts']}
            </div>
            <div className={cn('text-2xl font-bold', SUIT_COLORS[suit || 'hearts'])}>
              {rank}
            </div>
          </div>

          {/* Bottom right corner (upside down) */}
          <div className="absolute bottom-1 right-1 text-center rotate-180">
            <div className={cn('text-lg font-bold', SUIT_COLORS[suit || 'hearts'])}>
              {rank}
            </div>
            <div className={cn('text-sm', SUIT_COLORS[suit || 'hearts'])}>
              {SUIT_SYMBOLS[suit || 'hearts']}
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (dealAnimation) {
    return (
      <motion.div
        initial={{ rotateY: 90, x: 100, y: -100, opacity: 0 }}
        animate={{ rotateY: 0, x: 0, y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
          duration: 0.8,
        }}
        onClick={onClick}
        style={{ perspective: '1000px' }}
      >
        {cardContent}
      </motion.div>
    );
  }

  if (animated) {
    return (
      <motion.div
        whileHover={onClick ? { y: -10, scale: 1.05 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        onClick={onClick}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <div onClick={onClick}>
      {cardContent}
    </div>
  );
}

interface CardDealerAnimationProps {
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  duration?: number;
}

export function CardDealerAnimation({
  fromPosition,
  toPosition,
  suit,
  rank,
  duration = 0.6,
}: CardDealerAnimationProps) {
  return (
    <motion.div
      className="fixed pointer-events-none"
      initial={{
        x: fromPosition.x,
        y: fromPosition.y,
        rotateZ: -20,
        opacity: 1,
      }}
      animate={{
        x: toPosition.x,
        y: toPosition.y,
        rotateZ: 0,
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        type: 'cubic-bezier',
        duration,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    >
      <PlayingCard suit={suit} rank={rank} faceDown={false} />
    </motion.div>
  );
}
