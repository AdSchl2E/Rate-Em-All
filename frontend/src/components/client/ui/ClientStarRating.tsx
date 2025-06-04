'use client';

import { useState } from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { getRatingColor } from '../../../lib/utils/ratingColors';

interface ClientStarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  highlight?: boolean;
  fixed?: boolean;
  useColors?: boolean;
}

export function ClientStarRating({
  value = 0,
  onChange,
  disabled = false,
  size = 'md',
  highlight = false,
  fixed = false,
  useColors = true
}: ClientStarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getStarProps = (index: number) => {
    const rating = isHovering ? hoverRating : value;
    const isFilled = index <= rating;
    
    // Déterminer la couleur en fonction de la valeur
    let colorClass = 'text-slate-600'; // couleur par défaut pour les étoiles vides
    
    if (isFilled) {
      if (useColors && !isHovering) {
        // Utiliser la couleur basée sur la note
        colorClass = getRatingColor(value);
      } else {
        // Couleur standard pour le hover ou si useColors est false
        colorClass = highlight ? 'text-amber-400' : 'text-yellow-500';
      }
    }
    
    const sharedProps = {
      className: `${sizeClasses[size]} ${colorClass} transition-all duration-200`,
      'aria-hidden': true
    };
    
    return sharedProps;
  };

  const handleMouseOver = (index: number) => {
    if (disabled || fixed) return;
    
    setHoverRating(index);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (disabled || fixed) return;
    
    setHoverRating(0);
    setIsHovering(false);
  };

  const handleClick = (index: number) => {
    if (disabled || fixed || !onChange) return;
    
    onChange(index);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled || fixed || !onChange) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(index);
    }
  };

  return (
    <div 
      className={`flex items-center gap-1 ${disabled ? 'opacity-70' : ''}`}
      onMouseLeave={handleMouseLeave}
      role={onChange && !disabled && !fixed ? "radiogroup" : "presentation"}
      aria-label="Note"
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const rating = isHovering ? hoverRating : value;
        const isFilled = index <= rating;
        
        return (
          <span
            key={index}
            tabIndex={onChange && !disabled && !fixed ? 0 : -1}
            role={onChange && !disabled && !fixed ? "radio" : "presentation"}
            aria-checked={index === Math.round(value)}
            aria-label={`${index} étoile${index > 1 ? 's' : ''}`}
            className={`cursor-${disabled || fixed ? 'default' : 'pointer'} focus:outline-none focus:ring-2 focus:ring-blue-500 rounded`}
            onMouseOver={() => handleMouseOver(index)}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            data-rating={index}
          >
            {isFilled ? 
              <StarSolid {...getStarProps(index)} /> : 
              <StarOutline {...getStarProps(index)} />
            }
          </span>
        );
      })}
    </div>
  );
}