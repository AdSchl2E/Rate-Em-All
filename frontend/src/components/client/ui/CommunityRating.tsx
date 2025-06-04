'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { ClientStarRating } from './ClientStarRating';
import { getRatingColor } from '../../../lib/utils/ratingColors';

interface CommunityRatingProps {
  rating: number;
  votes: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // Ajout d'une taille XL
  showStars?: boolean;
  showVotes?: boolean;
  className?: string;
  prominent?: boolean;  // Nouvelle prop pour un affichage plus visible
}

export function CommunityRating({ 
  rating = 0, 
  votes = 0, 
  size = 'md',  // Taille par défaut passée à md
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
    md: 'h-6 w-6',  // Agrandi
    lg: 'h-7 w-7',  // Agrandi
    xl: 'h-9 w-9'   // Très grand
  };
  
  // Si prominent est activé, on prend une taille au-dessus
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
          <ClientStarRating value={rating} fixed={true} size={displaySize === 'xl' ? 'lg' : displaySize === 'xs' ? 'xs' : 'md'} useColors={true} />
        </div>
      )}
    </div>
  );
}