'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { Pokemon } from '@/types/pokemon';
import { useGlobal } from '@/providers/GlobalProvider';
import { getPokemonTypeColors } from '@/lib/utils/pokemonTypes';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ClientStarRating } from '@/components/client/ui/ClientStarRating';
import PokemonTypeTag from './PokemonTypeTag';
import PokemonStatsSection from '../pokemon/detail/PokemonStatsSection';
import PokemonInfoSection from '../pokemon/detail/PokemonInfoSection';
import PokemonSpeciesSection from '../pokemon/detail/PokemonSpeciesSection';

/**
 * Gets the color class for a rating value
 * 
 * @param rating - Rating value (0-5)
 * @returns CSS class for the rating color
 */
function getRatingColor(rating: number) {
  if (rating < 1) return 'text-gray-400';
  if (rating < 2) return 'text-yellow-400';
  if (rating < 3) return 'text-yellow-500';
  if (rating < 3.5) return 'text-amber-500';
  if (rating < 4) return 'text-amber-600';
  if (rating < 4.5) return 'text-orange-500';
  if (rating < 5) return 'text-orange-600';
  return 'text-red-500'; // For exactly 5
}

/**
 * Card size variants
 */
type CardSize = 'sm' | 'md' | 'lg';

/**
 * View mode options for the card
 */
type ViewMode = 'grid' | 'list' | 'detail';

/**
 * Props for the PokemonCard component
 */
interface PokemonCardProps {
  /** Pokemon data to display */
  pokemon: Pokemon;
  /** Whether to show action buttons (favorite, rate) */
  showActions?: boolean;
  /** Whether to show rating information */
  showRating?: boolean;
  /** Display mode for the card */
  viewMode?: ViewMode;
  /** Size variant of the card */
  size?: CardSize;
  /** Callback for when rating is updated */
  onRatingUpdate?: (rating: number, votes: number) => void;
}

/**
 * PokemonCard component
 * 
 * Versatile card component for displaying Pokemon information.
 * Supports different view modes, sizes, and interactive features.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function PokemonCard({
  pokemon,
  showActions = true,
  showRating = true,
  viewMode = 'grid',
  size = 'md',
  onRatingUpdate
}: PokemonCardProps) {
  const { status } = useSession();
  const { isFavorite, toggleFavorite, getRating, setRating, cachePokemon } = useGlobal();

  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  const [localUserRating, setLocalUserRating] = useState(0);

  // Local states for community ratings and vote count
  const [localCommunityRating, setLocalCommunityRating] = useState(pokemon.rating || 0);
  const [localVoteCount, setLocalVoteCount] = useState(pokemon.numberOfVotes || 0);

  // Use functions from the new GlobalProvider
  const isPokemonInFavorites = isFavorite(pokemon.id);
  const userRating = getRating(pokemon.id);

  // Initialize local states with Pokemon values
  useEffect(() => {
    setLocalUserRating(userRating);
    setLocalCommunityRating(pokemon.rating || 0);
    setLocalVoteCount(pokemon.numberOfVotes || 0);
  }, [userRating, pokemon.rating, pokemon.numberOfVotes]);

  // Move cachePokemon call to useEffect
  useEffect(() => {
    if (pokemon) {
      cachePokemon(pokemon);
    }
  }, [pokemon, cachePokemon]);

  // Get pokemon type colors for gradient background
  const [primaryColor, secondaryColor] = getPokemonTypeColors(pokemon);

  // Toggle favorite status
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated') {
      toast.error('Please sign in to add favorites');
      return;
    }

    try {
      setIsLoadingFavorite(true);

      // Use the toggleFavorite function from GlobalProvider that includes optimistic update
      const isFavoriteNow = await toggleFavorite(pokemon.id);

      // More subtle notification to avoid overwhelming the user
      toast.success(isFavoriteNow
        ? `${pokemon.name} added to favorites`
        : `${pokemon.name} removed from favorites`,
        { duration: 2000 }
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error modifying favorites');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Handle rating change
  const handleRatingChange = async (rating: number) => {
    if (status !== 'authenticated') {
      toast.error('Please sign in to rate Pokemon');
      return;
    }

    try {
      setIsLoadingRating(true);
      setLocalUserRating(rating);

      // Use the setRating function from GlobalProvider
      const result = await setRating(pokemon.id, rating);

      // Update local states with values returned by the API
      if (result) {
        // Get updated values from result
        const updatedRating = typeof result.updatedRating === 'number' ? 
          result.updatedRating : 
          (result.pokemon?.rating || localCommunityRating);
          
        const updatedVotes = typeof result.numberOfVotes === 'number' ? 
          result.numberOfVotes : 
          (result.pokemon?.numberOfVotes || localVoteCount);

        setLocalCommunityRating(updatedRating);
        setLocalVoteCount(updatedVotes);

        // Update the Pokemon in the cache
        cachePokemon({
          ...pokemon,
          userRating: rating,
          rating: updatedRating,
          numberOfVotes: updatedVotes
        });
        
        // Propagate the update to the parent if necessary
        if (onRatingUpdate) {
          onRatingUpdate(updatedRating, updatedVotes);
        }
      }

      // More subtle notification
      toast.success(`You rated ${pokemon.name} ${rating}/5`, {
        duration: 2000
      });
    } catch (error) {
      console.error('Error rating pokemon:', error);
      toast.error('Error saving the rating');
      setLocalUserRating(userRating);
    } finally {
      setIsLoadingRating(false);
    }
  };

  // Define classes and dimensions based on size
  const listSizeClasses = {
    sm: {
      container: "p-1.5",
      image: "w-12 h-12",
      imageSize: { width: 40, height: 40 },
      name: "text-sm",
      idBadge: "text-xs px-0.5",
      type: "px-1 py-0 text-xs",
      starSize: "sm",
      commRating: {
        container: "px-1.5 py-0.5",
        icon: "h-4 w-4 mr-0.5",
        text: "text-sm"
      },
      heartIcon: "h-3.5 w-3.5",
      gap: "gap-2"
    },
    md: {
      container: "p-2",
      image: "w-16 h-16",
      imageSize: { width: 50, height: 50 },
      name: "text-base",
      idBadge: "text-xs px-1",
      type: "px-1.5 py-0.5 text-xs",
      starSize: "md",
      commRating: {
        container: "px-2 py-1",
        icon: "h-6 w-6 mr-1",
        text: "text-base"
      },
      heartIcon: "h-4 w-4",
      gap: "gap-3"
    },
    lg: {
      container: "p-3",
      image: "w-20 h-20",
      imageSize: { width: 60, height: 60 },
      name: "text-lg",
      idBadge: "text-sm px-1.5",
      type: "px-2 py-0.5 text-sm",
      starSize: "lg",
      commRating: {
        container: "px-3 py-1.5",
        icon: "h-7 w-7 mr-1.5",
        text: "text-lg"
      },
      heartIcon: "h-5 w-5",
      gap: "gap-4"
    }
  };

  const gridSizeClasses = {
    sm: {
      imageHeight: "h-24",
      imageSize: { width: 80, height: 80 },
      container: "p-2",
      name: "text-sm",
      commRating: {
        container: "px-1.5 py-0.5",
        icon: "h-4 w-4 mr-0.5",
        text: "text-sm"
      },
      starSize: "sm"
    },
    md: {
      imageHeight: "h-32",
      imageSize: { width: 100, height: 100 },
      container: "p-4",
      name: "text-base",
      commRating: {
        container: "px-2 py-0.5",
        icon: "h-5 w-5 mr-1",
        text: "text-base"
      },
      starSize: "md"
    },
    lg: {
      imageHeight: "h-40",
      imageSize: { width: 120, height: 120 },
      container: "p-5",
      name: "text-lg",
      commRating: {
        container: "px-2.5 py-1.5",
        icon: "h-6 w-6 mr-1.5",
        text: "text-lg"
      },
      starSize: "lg"
    }
  };

  // DETAIL MODE - New mode for the main detail page of a Pokemon
  if (viewMode === 'detail') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-xl overflow-hidden shadow-xl"
      >
        <div className="md:flex">
          {/* Pokemon image section */}
          <div 
            className="md:w-1/2 p-8 flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}40)` }}
          >
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br"
                style={{ background: `radial-gradient(circle at center, ${primaryColor}, ${secondaryColor} 80%)` }}></div>
            
            <motion.div
              className="relative w-64 h-64 flex items-center justify-center z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.2
              }}
            >
              <Image
                src={pokemon.sprites.other?.['official-artwork']?.front_default || 
                      pokemon.sprites.front_default || 
                      '/images/pokeball.png'
                }
                alt={pokemon.name}
                fill
                sizes="(max-width: 768px) 300px, 600px"
                className="object-contain drop-shadow-2xl"
                priority
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/pokeball.png";
                }}
              />
            </motion.div>
          </div>
          
          {/* Information section */}
          <div className="md:w-1/2 p-6">
            {/* Header with name, ID, types */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-3xl font-bold capitalize">
                  {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).replace(/-/g, ' ')}
                </h1>
                <span className="text-xl text-gray-400 font-mono">#{pokemon.id}</span>
              </div>
              
              <div className="flex gap-2">
                {pokemon.types?.map((typeObj, index) => (
                  <PokemonTypeTag key={index} type={typeObj.type.name} className="px-3 py-1 text-sm" />
                ))}
              </div>
            </div>
            
            {/* Rating section */}
            <div className="mb-6 space-y-4">
              {/* Community rating */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-2">Community rating</h3>
                <div className="flex items-center">
                  <div className="flex items-center bg-gray-700/80 px-3 py-2 rounded-md">
                    <StarIcon className={`h-6 w-6 mr-2 ${getRatingColor(localCommunityRating)}`} />
                    <span className={`font-bold text-xl ${getRatingColor(localCommunityRating)}`}>
                      {localCommunityRating > 0 ? localCommunityRating.toFixed(1) : '0.0'}
                      <span className="ml-2 font-normal opacity-70 text-base">
                        ({localVoteCount} vote{localVoteCount !== 1 ? 's' : ''})
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
              
              {/* User rating */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="pt-4 border-t border-gray-700"
              >
                <h3 className="text-lg font-medium mb-2">Your rating</h3>
                <div>
                  <ClientStarRating
                    value={localUserRating}
                    onChange={handleRatingChange}
                    size="lg"
                    disabled={isLoadingRating}
                    useColors={true}
                  />
                  
                  {status !== 'authenticated' && (
                    <p className="text-sm text-gray-400 mt-2">
                      <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link> to rate this Pokémon
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* User actions (favorites, share) */}
            <div className="flex flex-wrap gap-3">
              {/* Favorites button */}
              <motion.button 
                onClick={handleToggleFavorite} 
                disabled={isLoadingFavorite || status !== 'authenticated'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isPokemonInFavorites 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <HeartIcon className="h-5 w-5" /> 
                {isPokemonInFavorites ? 'Remove from favorites' : 'Add to favorites'}
              </motion.button>
              
              {/* Other action buttons can be added here */}
            </div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="border-t border-gray-700 p-6">
          <PokemonStatsSection stats={pokemon.stats || []} />
        </div>
        
        {/* Additional information */}
        <PokemonInfoSection pokemon={pokemon} />
        
        {/* Species information */}
        <PokemonSpeciesSection pokemon={pokemon} />
      </motion.div>
    );
  }

  // List version with adjustable size
  if (viewMode === 'list') {
    const listClasses = listSizeClasses[size];

    return (
      <div className="bg-gray-800/40 hover:bg-gray-800/60 rounded-lg transition-all duration-200 shadow-sm">
        <div className={`flex items-center flex-wrap sm:flex-nowrap ${listClasses.container}`}>
          {/* Image with colored background (left) */}
          <div className="relative mr-3 flex-shrink-0">
            <div
              className={`${listClasses.image} rounded-lg flex items-center justify-center`}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}50 0%, ${secondaryColor}80 100%)`
              }}
            >
              <Link href={`/pokemon/${pokemon.id}`}>
                <Image
                  src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/images/pokeball.png'}
                  width={listClasses.imageSize.width}
                  height={listClasses.imageSize.height}
                  alt={pokemon.name}
                  className="drop-shadow-md z-10"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/pokeball.png';
                  }}
                />
              </Link>
              <div className={`absolute bottom-0 right-0 bg-black/40 rounded font-mono ${listClasses.idBadge} text-gray-200`}>
                #{pokemon.id}
              </div>
            </div>
          </div>

          {/* Name and types (center) */}
          <div className="flex-grow">
            <Link href={`/pokemon/${pokemon.id}`} className="block">
              <h3 className={`font-medium capitalize hover:text-blue-400 transition truncate ${listClasses.name}`}>
                {pokemon.name.replace(/-/g, ' ')}
              </h3>
            </Link>

            <div className="flex flex-wrap gap-1 mt-1">
              {pokemon.types?.map((typeObj, idx) => (
                <PokemonTypeTag
                  key={idx}
                  type={typeObj.type.name}
                  className={listClasses.type}
                />
              ))}
            </div>
          </div>

          {/* Actions (right): Favorite button, user rating, community rating */}
          <div className={`flex items-center justify-center w-full sm:w-auto ${listClasses.gap} ml-0 sm:ml-2 mt-2 sm:mt-0`}>
            {/* Favorite button */}
            {showActions && (
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center p-1.5 rounded-full 
                  ${isPokemonInFavorites ? 'bg-red-500/90 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}
                  transition-all duration-200 hover:scale-110`}
                disabled={isLoadingFavorite}
                title={isPokemonInFavorites ? "Remove from favorites" : "Add to favorites"}
              >
                <HeartIcon className={listClasses.heartIcon} />
              </button>
            )}

            {/* User rating */}
            {showActions && showRating && (
              <div className="flex flex-col items-center">
                <ClientStarRating
                  value={localUserRating}
                  onChange={handleRatingChange}
                  size={listClasses.starSize as any}
                  disabled={isLoadingRating || status !== 'authenticated'}
                  useColors={true}
                />
              </div>
            )}

            {/* Community rating - USES UPDATED LOCAL VALUES */}
            {showRating && (
              <div className="flex flex-col items-center">
                <motion.div
                  className={`flex items-center bg-gray-800/60 rounded-md ${listClasses.commRating.container}`}
                  animate={{ scale: isLoadingRating ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <StarIcon
                    className={`${listClasses.commRating.icon} ${getRatingColor(localCommunityRating)}`}
                  />
                  <span className={`font-bold ${listClasses.commRating.text} ${getRatingColor(localCommunityRating)}`}>
                    {localCommunityRating > 0 ? localCommunityRating.toFixed(1) : '0.0'}
                    <span className="ml-1 font-normal opacity-70 text-sm">
                      ({localVoteCount})
                    </span>
                  </span>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid mode
  const gridClasses = gridSizeClasses[size];

  return (
    <motion.div
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg relative group"
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
    >
      {/* Image section with subtle colored background */}
      <div className={`flex items-center justify-center bg-gray-850 relative ${gridClasses.imageHeight}`}>
        {/* Subtle background with type color */}
        <div
          className="absolute inset-0 backdrop-filter backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}25 0%, ${secondaryColor}30 100%)`
          }}
        />

        <Link href={`/pokemon/${pokemon.id}`} className="relative z-10">
          <Image
            src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/images/pokeball.png'}
            width={gridClasses.imageSize.width}
            height={gridClasses.imageSize.height}
            alt={pokemon.name}
            className="drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/pokeball.png';
            }}
          />
        </Link>

        <div className="absolute top-2 right-2 bg-black/40 rounded p-1 text-xs font-mono text-gray-200">
          #{pokemon.id}
        </div>

        {/* Floating favorite button */}
        {showActions && (
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-2 left-2 flex items-center justify-center p-1.5 rounded-full shadow-md z-20
              ${isPokemonInFavorites
                ? 'bg-red-500/90 text-white hover:bg-red-600'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
              } backdrop-blur-sm transition-all`}
            disabled={isLoadingFavorite}
            title={isPokemonInFavorites ? "Remove from favorites" : "Add to favorites"}
          >
            <HeartIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={gridClasses.container}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-medium capitalize ${gridClasses.name}`}>
            <Link href={`/pokemon/${pokemon.id}`} className="hover:text-blue-400 transition">
              {
                size === 'sm' && pokemon.name.length > 10
                  ? `${pokemon.name.slice(0, 8).replace(/-/g, ' ')}...`
                : size === 'md' && pokemon.name.length > 11
                  ? `${pokemon.name.slice(0, 9).replace(/-/g, ' ')}...`
                : pokemon.name.replace(/-/g, ' ')
              }
            </Link>
          </h3>

          {/* Community rating - USES UPDATED LOCAL VALUES */}
          {showRating && (
            <motion.div
              className={`flex items-center bg-gray-700/60 rounded-md ${gridClasses.commRating.container}`}
              animate={{ scale: isLoadingRating ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <StarIcon
                className={`${gridClasses.commRating.icon} ${getRatingColor(localCommunityRating)}`}
              />
              <span className={`font-bold ${gridClasses.commRating.text} ${getRatingColor(localCommunityRating)}`}>
                {localCommunityRating > 0 ? localCommunityRating.toFixed(1) : '0.0'}
                <span className="ml-1 font-normal opacity-70 text-xs">
                  ({localVoteCount})
                </span>
              </span>
            </motion.div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {pokemon.types?.map((typeObj, idx) => (
            <PokemonTypeTag
              key={idx}
              type={typeObj.type.name}
              className="px-2 py-0.5 text-xs"
            />
          ))}
        </div>

        {/* User rating section */}
        {showRating && (
          <div className="mt-3 border-t border-gray-700 pt-3">
            <div className="flex items-center justify-center">
              <ClientStarRating
                value={localUserRating}
                onChange={handleRatingChange}
                size={gridClasses.starSize as any}
                disabled={isLoadingRating || status !== 'authenticated'}
                useColors={true}
              />
            </div>
            {status !== 'authenticated' && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                <Link href="/login" className="text-blue-400 hover:underline">
                  Sign in
                </Link> to rate
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}