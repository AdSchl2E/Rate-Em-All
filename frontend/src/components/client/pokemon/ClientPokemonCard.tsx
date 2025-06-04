'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useFavorites } from '../../../providers/FavoritesProvider';
import { useRatings } from '../../../providers/RatingsProvider';
import { useSession } from 'next-auth/react';
import { ClientStarRating } from '../ui/ClientStarRating';
import { Pokemon } from '../../../types/pokemon';
import { typeColors } from '../../../lib/utils/pokemonTypes';
import { HeartIcon, StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

interface ClientPokemonCardProps {
  pokemon: Pokemon;
  showRating?: boolean;
  showActions?: boolean;
  highlighted?: boolean;
  rank?: number;
}

export function ClientPokemonCard({ 
  pokemon, 
  showRating = true,
  showActions = true,
  highlighted = false,
  rank
}: ClientPokemonCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getRating, hasRated, setRating } = useRatings();
  
  const [isRating, setIsRating] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  // Context values
  const pokemonUserRating = getRating(pokemon.id);
  const isPokemonRated = hasRated(pokemon.id);
  const isPokemonFavorite = isFavorite(pokemon.id);

  // Main type for gradient color
  const mainType = pokemon.types?.[0]?.type.name || 'normal';
  const gradientColor = typeColors[mainType] || '#AAAAAA';

  const handleRate = async (rating: number) => {
    if (!userId) {
      toast.custom((t) => (
        <div className="bg-gray-800 border border-gray-700 text-gray-50 rounded-lg shadow-lg px-4 py-3 flex items-center">
          <div className="mr-3 bg-gray-700 p-2 rounded-full">
            <StarIcon className="h-5 w-5 text-amber-400" />
          </div>
          <p>Login to rate this Pokémon</p>
        </div>
      ));
      return;
    }
    
    setIsRating(true);
    try {
      await setRating(pokemon.id, rating);
      toast.custom((t) => (
        <div className="bg-gray-800 border border-gray-700 text-gray-50 rounded-lg shadow-lg px-4 py-3 flex items-center">
          <div className="mr-3 bg-blue-500/20 p-2 rounded-full">
            <StarIcon className="h-5 w-5 text-amber-400" />
          </div>
          <p>You rated <span className="font-medium text-blue-400">{pokemon.name}</span> {rating}/5</p>
        </div>
      ));
    } catch (error) {
      toast.error("Error while rating");
    } finally {
      setIsRating(false);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId) {
      toast.custom((t) => (
        <div className="bg-gray-800 border border-gray-700 text-gray-50 rounded-lg shadow-lg px-4 py-3 flex items-center">
          <div className="mr-3 bg-gray-700 p-2 rounded-full">
            <HeartIcon className="h-5 w-5 text-red-500" />
          </div>
          <p>Login to add to favorites</p>
        </div>
      ));
      return;
    }

    toggleFavorite(pokemon.id)
      .then(isNowFavorite => {
        const message = isNowFavorite 
          ? `${pokemon.name} added to favorites`
          : `${pokemon.name} removed from favorites`;
        
        toast.custom((t) => (
          <div className="bg-gray-800 border border-gray-700 text-gray-50 rounded-lg shadow-lg px-4 py-3 flex items-center">
            <div className="mr-3 bg-red-500/20 p-2 rounded-full">
              {isNowFavorite ? 
                <HeartIcon className="h-5 w-5 text-red-500" /> : 
                <HeartOutline className="h-5 w-5 text-gray-400" />
              }
            </div>
            <p>{message}</p>
          </div>
        ));
      })
      .catch(() => {
        toast.error("An error occurred");
      });
  };

  const navigateToDetails = () => {
    router.push(`/pokemon/${pokemon.id}`);
  };

  // Capitalize first letter
  const formattedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <div 
      onClick={navigateToDetails}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`pokemon-card group relative ${highlighted ? 'ring-2 ring-amber-400' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${formattedName}`}
    >
      {/* Image with type background */}
      <div className="relative overflow-hidden h-56">
        <div className="absolute inset-0 opacity-20" 
          style={{ 
            background: `radial-gradient(circle at center, ${gradientColor} 0%, transparent 70%)` 
          }}
        ></div>
        
        <div className={`relative w-full h-full flex items-center justify-center ${isHovering ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
          <Image 
            src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/placeholder.png'}
            alt={formattedName}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-contain p-2"
          />
        </div>
        
        {/* Rank and favorite badge */}
        <div className="absolute top-0 left-0 w-full p-2 flex justify-between">
          {rank && (
            <span className="badge badge-purple">
              #{rank}
            </span>
          )}
          
          {isPokemonFavorite && (
            <span className="badge badge-red ml-auto flex items-center gap-1">
              <HeartIcon className="h-6 w-6" />
            </span>
          )}
        </div>
        
        {/* Favorite button - Always visible now */}
        {showActions && (
          <button 
            className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-300
            ${isPokemonFavorite ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={handleFavorite}
            aria-label={isPokemonFavorite ? `Remove ${formattedName} from favorites` : `Add ${formattedName} to favorites`}
          >
            <HeartIcon className="h-6 w-6" />
          </button>
        )}
        
        {/* Types with capitalization */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-1 gap-1">
          {pokemon.types?.map((typeObj, index) => {
            const type = typeObj.type.name;
            // Add proper capitalization
            const typeName = type.charAt(0).toUpperCase() + type.slice(1);
            return (
              <span 
                key={index}
                className="badge text-xs px-2.5 py-1 text-white font-medium"
                style={{ backgroundColor: typeColors[type] || '#AAAAAA' }}
                title={`Type: ${typeName}`}
              >
                {typeName}
              </span>
            );
          })}
        </div>
      </div>

      {/* Information section */}
      <div className="p-3 flex flex-col items-center">
        <div className="flex items-center mb-2 gap-2">
          <h3 className="text-lg font-medium">
            {formattedName}
          </h3>
          <span className="text-sm text-gray-400 font-medium">
            #{pokemon.id}
          </span>
        </div>
        
        {/* IMPROVED COMMUNITY RATING - Numerical with star icon and vote count */}
        {showRating && (
          <div className="flex items-center justify-center px-4 py-2 bg-gray-700/50 rounded-full" data-pokemon-id={pokemon.id}>
            <StarIcon className="h-6 w-6 text-amber-400 mr-1.5" />
            <span 
              className="font-medium text-amber-100"
              data-community-rating
              data-rating={pokemon.rating || 0}
              data-votes={pokemon.numberOfVotes || 0}
            >
              {(pokemon.rating || 0).toFixed(1)}
            </span>
            <span className="text-xs text-gray-400 ml-1" data-vote-count>
              ({pokemon.numberOfVotes || 0})
            </span>
          </div>
        )}
        
        {/* IMPROVED USER RATING - More prominent and clearer indication */}
        {showActions && (
          <div 
            className={`mt-3 w-full rounded-lg px-3 py-2
              ${isPokemonRated 
                ? 'bg-blue-700/40 border-2 border-blue-400 hover:border-blue-300/50' 
                : 'bg-gray-700/30 border border-gray-700/50 hover:border-gray-500/50'}
              transition-all duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex justify-center">
              <ClientStarRating 
                value={pokemonUserRating} 
                onChange={handleRate} 
                disabled={isRating || !userId}
                highlight={isPokemonRated}
                size="lg"
              />
            </div>
          
          </div>
        )}
      </div>
    </div>
  );
}