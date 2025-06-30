'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { ClientStarRating } from './ClientStarRating';
import { getRatingColor } from '../../../lib/utils/ratingColors';

/**
 * Props for the CommunityRating component
 */
interface CommunityRatingProps {
  /** Average rating value (0-5) */
  rating: number;
  /** Number of votes/ratings submitted */
  votes: number;
  /** Size variant of the rating display */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // Added XL size
  /** Whether to show the star rating visualization */
  showStars?: boolean;
  /** Whether to show the vote count */
  showVotes?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to use a more prominent visual style */
  prominent?: boolean;  // New prop for more visible display
}

/**
 * CommunityRating component
 * 
 * Displays the average community rating for an item with optional stars visualization.
 * Can be configured with different sizes and display options.
 * 
 * @param props - Component props
 * @returns React component
 */
export function CommunityRating({ 
  rating = 0, 
  votes = 0, 
  size = 'md',  // Default size changed to md
  showStars = true,
  showVotes = true,
  className = '',
  prominent = false
}: CommunityRatingProps) {
  const colorClass = getRatingColor(rating);
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };
  
  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',  // Enlarged
    lg: 'h-7 w-7',  // Enlarged
    xl: 'h-9 w-9'   // Very large
  };
  
  // If prominent is enabled, use one size larger
  const displaySize = prominent ? (
    size === 'xs' ? 'sm' : 
    size === 'sm' ? 'md' : 
    size === 'md' ? 'lg' : 'xl'
  ) : size;

  return (
    <div className={`flex items-center justify-center ${className} ${prominent ? 'py-1 px-3 bg-gray-800/60 rounded-lg shadow-inner border border-gray-700/50' : ''}`} data-community-rating>
      <StarIcon className={`${iconSizes[displaySize]} ${colorClass} mr-1`} />
      <span 
        className={`font-bold ${colorClass} ${sizeClasses[displaySize]}`}
        data-rating={rating}
        data-votes={votes}
      >
        {rating.toFixed(1)}
      </span>
      {showVotes && (
        <span className={`text-gray-400 ml-1 ${size === 'xs' ? 'text-xs' : 'text-sm'}`} data-vote-count>
          ({votes})
        </span>
      )}
      
      {showStars && (
        <div className="ml-2">
          <ClientStarRating value={rating} interactive={false} size={displaySize === 'xl' ? 'lg' : displaySize === 'xs' ? 'xs' : 'md'} useColors={true} />
        </div>
      )}
    </div>
  );
}