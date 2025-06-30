'use client';

import { Pokemon } from '@/types/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { typeColors } from '@/lib/utils/pokemonTypes';
import { ClientStarRating } from '@/components/client/ui/ClientStarRating';
import { CommunityRating } from '@/components/client/ui/CommunityRating';

/**
 * Props for the PokemonList component
 */
interface PokemonListProps {
  /** List of Pokemon to display */
  pokemons: Pokemon[];
  /** User's ratings for Pokemon (keyed by Pokemon ID) */
  userRatings: Record<number, number>;
  /** Cached community ratings data (keyed by Pokemon ID) */
  pokemonCache: Record<number, { rating: number; numberOfVotes: number }>;
  /** List of the user's favorite Pokemon IDs */
  favorites: number[];
}

/**
 * PokemonList component
 * 
 * Displays a list of Pokemon in a compact list view format.
 * Shows Pokemon information, types, user ratings, and community ratings.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function PokemonList({ 
  pokemons, 
  userRatings, 
  pokemonCache,
  favorites 
}: PokemonListProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {pokemons.map((pokemon, idx) => (
        <motion.div key={pokemon.id} variants={itemVariants}>
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-800/70"} hover:bg-gray-700 transition`}
          >
            {/* Pokémon info with image, name and types */}
            <Link href={`/pokemon/${pokemon.id}`} className="flex items-center gap-3 flex-grow hover:text-blue-400 transition">
              <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <Image
                  src={pokemon.sprites.front_default || '/images/pokeball.png'}
                  alt={pokemon.name}
                  width={48}
                  height={48}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/pokeball.png";
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <span className="capitalize font-medium">{pokemon.name}</span>
                  {favorites.includes(pokemon.id) && (
                    <HeartIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>

                {/* Types */}
                <div className="flex gap-1 mt-1">
                  {pokemon.types?.map((typeObj, typeIdx) => {
                    const type = typeObj.type.name;
                    return (
                      <span
                        key={typeIdx}
                        className="badge px-1.5 py-0.5 text-xs text-white font-medium"
                        style={{ backgroundColor: typeColors[type] }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Link>

            {/* Ratings section */}
            <div className="flex items-center gap-6">
              {/* User rating */}
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-1">
                  <ClientStarRating value={userRatings[pokemon.id] || 0} size="sm" useColors={true} />
                </div>
              </div>

              {/* Community rating */}
              <div>
                <CommunityRating
                  rating={pokemonCache[pokemon.id]?.rating || pokemon.rating || 0}
                  votes={pokemonCache[pokemon.id]?.numberOfVotes || pokemon.numberOfVotes || 0}
                  size="md"
                  showStars={false}
                  prominent={true}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}