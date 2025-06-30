'use client';

import { useState } from 'react';
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

/**
 * Props for the ClientStarRating component
 */
interface ClientStarRatingProps {
  /** Current rating value (0-5) */
  value: number;
  /** Callback function when rating is changed */
  onChange?: (rating: number) => void;
  /** Size variant of the stars */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Whether the rating is disabled/readonly */
  disabled?: boolean;
  /** Whether to use color gradients based on rating value */
  useColors?: boolean;
  /** Whether the rating can be interacted with */
  interactive?: boolean;
  /** Spacing between stars */
  starSpacing?: 'normal' | 'tight' | 'wide';
}

/**
 * ClientStarRating component
 * 
 * Client-side interactive star rating component that allows users to rate items.
 * Supports different sizes, colors, and interactivity options.
 * 
 * @param props - Component props
 * @returns React component
 */
export function ClientStarRating({
  value = 0,
  onChange,
  size = 'md',
  disabled = false,
  useColors = false,
  interactive = true,
  starSpacing = 'normal'
}: ClientStarRatingProps) {
  // Local state to track hovered value
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  // Define star sizes based on size prop
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Define spacing classes
  const spacingClasses = {
    tight: 'gap-0.5',
    normal: 'gap-1',
    wide: 'gap-2'
  };

  // Function to determine star color based on value
  const getStarColor = (starPosition: number) => {
    // If a value is hovered, use it to determine the color
    const ratingToUse = hoveredValue !== null ? hoveredValue : value;

    if (!useColors) {
      return 'text-yellow-500';
    }

    // If the star is filled (its position is <= the value)
    if (starPosition <= ratingToUse) {
      if (ratingToUse < 1) return 'text-gray-400';
      if (ratingToUse < 2) return 'text-yellow-400';
      if (ratingToUse < 3) return 'text-yellow-500';
      if (ratingToUse < 3.5) return 'text-amber-500';
      if (ratingToUse < 4) return 'text-amber-600';
      if (ratingToUse < 4.5) return 'text-orange-500';
      if (ratingToUse < 5) return 'text-orange-600';
      return 'text-red-500'; // 5 stars: red
    }

    return 'text-gray-400'; // Unfilled star
  };

  // Handle star click
  const handleStarClick = (newValue: number) => {
    if (disabled || !interactive || !onChange) return;
    onChange(newValue);
  };

  // Handle star hover
  const handleStarHover = (newValue: number) => {
    if (disabled || !interactive) return;
    setHoveredValue(newValue);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredValue(null);
  };

  return (
    <div
      className={`flex items-center ${spacingClasses[starSpacing]}`}
      onMouseLeave={handleMouseLeave}
      aria-label={`Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map(starValue => {
        // Star is filled if its value is <= current value (or hovered value)
        const isFilled = starValue <= (hoveredValue !== null ? hoveredValue : value);

        return (
          <span
            key={starValue}
            className={`${sizeClasses[size]} ${getStarColor(starValue)} cursor-pointer transition-colors duration-200`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            title={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            {isFilled ? (
              <StarIcon className="w-full h-full" />
            ) : (
              <OutlineStarIcon className="w-full h-full" />
            )}
          </span>
        );
      })}
    </div>
  );
}