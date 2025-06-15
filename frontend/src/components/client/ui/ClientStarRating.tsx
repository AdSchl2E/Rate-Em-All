'use client';

import { useState } from 'react';
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface ClientStarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  useColors?: boolean;
  interactive?: boolean;
  starSpacing?: 'normal' | 'tight' | 'wide';
}

export function ClientStarRating({
  value = 0,
  onChange,
  size = 'md',
  disabled = false,
  useColors = false,
  interactive = true,
  starSpacing = 'normal'
}: ClientStarRatingProps) {
  // État local pour suivre la valeur survolée
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  // Définir la taille des étoiles selon la prop size
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Définir les classes d'espacement
  const spacingClasses = {
    tight: 'gap-0.5',
    normal: 'gap-1',
    wide: 'gap-2'
  };

  // Fonction pour définir la couleur des étoiles en fonction de la valeur
  const getStarColor = (starPosition: number) => {
    // Si une valeur est survolée, l'utiliser pour déterminer la couleur
    const ratingToUse = hoveredValue !== null ? hoveredValue : value;

    if (!useColors) {
      return 'text-yellow-500';
    }

    // Si l'étoile est remplie (sa position est <= à la valeur)
    if (starPosition <= ratingToUse) {
      if (ratingToUse < 1) return 'text-gray-400';
      if (ratingToUse < 2) return 'text-yellow-400';
      if (ratingToUse < 3) return 'text-yellow-500';
      if (ratingToUse < 3.5) return 'text-amber-500';
      if (ratingToUse < 4) return 'text-amber-600';
      if (ratingToUse < 4.5) return 'text-orange-500';
      if (ratingToUse < 5) return 'text-orange-600';
      return 'text-red-500'; // 5 étoiles: red
    }

    return 'text-gray-400'; // Étoile non remplie
  };

  // Gérer le clic sur une étoile
  const handleStarClick = (newValue: number) => {
    if (disabled || !interactive || !onChange) return;
    onChange(newValue);
  };

  // Gérer le survol d'une étoile
  const handleStarHover = (newValue: number) => {
    if (disabled || !interactive) return;
    setHoveredValue(newValue);
  };

  // Gérer la sortie du survol
  const handleMouseLeave = () => {
    setHoveredValue(null);
  };

  return (
    <div
      className={`flex items-center ${spacingClasses[starSpacing]}`}
      onMouseLeave={handleMouseLeave}
      aria-label={`Note: ${value} sur 5`}
    >
      {[1, 2, 3, 4, 5].map(starValue => {
        // L'étoile est pleine si sa valeur est <= à la valeur actuelle (ou valeur survolée)
        const isFilled = starValue <= (hoveredValue !== null ? hoveredValue : value);

        return (
          <span
            key={starValue}
            className={`${sizeClasses[size]} ${getStarColor(starValue)} cursor-pointer transition-colors duration-200`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            title={`${starValue} étoile${starValue > 1 ? 's' : ''}`}
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