import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  count?: number;
  className?: string;
}

const SIZE_MAP = {
  xs: 'size-3',
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-7',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  count,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = interactive && hoverRating !== null ? hoverRating : rating;

  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const starIconSize = SIZE_MAP[size] || 'size-4';

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= activeRating;
          const isHalf = !isFilled && starValue - 0.5 <= activeRating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              className={`transition-transform ${
                interactive
                  ? 'cursor-pointer hover:scale-115 focus:outline-none'
                  : 'cursor-default pointer-events-none'
              } p-0.5`}
              aria-label={interactive ? `Rate ${starValue} stars` : `${activeRating} stars`}
            >
              <Star
                className={`${starIconSize} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-muted text-muted-foreground/30'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1 text-xs font-bold text-foreground">
          {rating.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  );
};
