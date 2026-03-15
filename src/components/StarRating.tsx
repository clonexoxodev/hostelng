import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;          // current value
  max?: number;            // default 5
  interactive?: boolean;   // clickable
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };

const StarRating = ({ rating, max = 5, interactive = false, size = 'md', onChange }: StarRatingProps) => {
  const sizeClass = sizes[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            aria-label={`${i + 1} star${i !== 0 ? 's' : ''}`}
          >
            <Star
              className={`${sizeClass} transition-colors ${
                filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
