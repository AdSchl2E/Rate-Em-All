'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

interface RatingFilterProps {
  minRating: number;
  onChange: (minRating: number) => void;
}

export default function RatingFilter({ minRating, onChange }: RatingFilterProps) {
  // État pour le hover
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleRatingClick = (rating: number) => {
    if (rating === minRating) {
      // Reset if clicking on already selected rating
      onChange(0);
    } else {
      onChange(rating);
    }
  };
  
  // Exemple de description conditionnelle pour chaque note
  const getRatingDescription = (rating: number): string => {
    switch(rating) {
      case 1: return "Médiocre";
      case 2: return "Passable";
      case 3: return "Bien";
      case 4: return "Très bien";
      case 5: return "Excellent";
      default: return "Tous les Pokémon";
    }
  };
  
  const description = getRatingDescription(hoverRating || minRating);
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center space-x-2 mb-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onMouseEnter={() => setHoverRating(rating)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingClick(rating)}
              className={`p-1.5 transition-transform ${
                (hoverRating || minRating) >= rating 
                  ? 'text-yellow-400 hover:scale-110' 
                  : 'text-gray-500 hover:text-gray-300'
              } ${
                rating <= minRating ? 'scale-110' : ''
              }`}
            >
              {(hoverRating || minRating) >= rating ? (
                <StarIcon className="h-8 w-8" />
              ) : (
                <StarIconOutline className="h-8 w-8" />
              )}
            </button>
          ))}
        </div>
        <div className="text-gray-300 h-6">
          {(hoverRating || minRating) > 0 ? (
            <>Pokémon notés <span className="font-bold">{description}</span> ou mieux</>
          ) : (
            <span className="text-gray-500">Tous les Pokémon, quelle que soit leur note</span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange(4)}
          className={`py-2 px-3 rounded-lg ${
            minRating === 4 
              ? 'bg-amber-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600'
          } transition`}
        >
          4+ étoiles
        </button>
        
        <button
          onClick={() => onChange(3)}
          className={`py-2 px-3 rounded-lg ${
            minRating === 3 
              ? 'bg-amber-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600'
          } transition`}
        >
          3+ étoiles
        </button>
        
        <button
          onClick={() => onChange(0)}
          className={`py-2 px-3 rounded-lg col-span-2 ${
            minRating === 0 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600'
          } transition`}
        >
          Tous les Pokémon
        </button>
      </div>
    </div>
  );
}