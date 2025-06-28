'use client';

import { Pokemon } from '@/types/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import { typeColors } from '@/lib/utils/pokemonTypes';
import { ClientStarRating } from '@/components/client/ui/ClientStarRating';
import { CommunityRating } from '@/components/client/ui/CommunityRating';
import { getRatingColor } from '@/lib/utils/ratingColors';
import { motion } from 'framer-motion';

interface PokemonGridProps {
  pokemons: Pokemon[];
  userRatings: Record<number, number>;
  pokemonCache: Record<number, { rating: number; numberOfVotes: number }>;
  favorites: number[];
}

export default function PokemonGrid({ 
  pokemons, 
  userRatings, 
  pokemonCache,
  favorites 
}: PokemonGridProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {pokemons.map(pokemon => (
        <motion.div key={pokemon.id} variants={itemVariants}>
          <div className="bg-gray-800 hover:bg-gray-700 transition rounded-lg overflow-hidden h-full">
            <Link href={`/pokemon/${pokemon.id}`} className="block h-full">
              {/* Image section */}
              <div className="relative h-32 flex items-center justify-center">
                {pokemon.types && pokemon.types[0] && (
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at center, ${typeColors[pokemon.types[0].type.name] || '#777'} 0%, transparent 70%)`
                    }}
                  ></div>
                )}
                <Image
                  src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/images/pokeball.png'}
                  alt={pokemon.name}
                  width={90}
                  height={90}
                  className="object-contain z-10"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/pokeball.png";
                  }}
                />

                {/* Type badges */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-1 gap-1">
                  {pokemon.types?.map((typeObj, idx) => {
                    const type = typeObj.type.name;
                    return (
                      <span
                        key={idx}
                        className="badge text-xs px-2 py-0.5 text-white font-medium"
                        style={{ backgroundColor: typeColors[type] || '#AAAAAA' }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Pokemon info */}
              <div className="p-3">
                <h3 className="text-center font-medium capitalize mb-2">{pokemon.name}</h3>

                <div className="flex items-center justify-between px-2 flex-col gap-2">
                  <CommunityRating
                    rating={pokemonCache[pokemon.id]?.rating || pokemon.rating || 0}
                    votes={pokemonCache[pokemon.id]?.numberOfVotes || pokemon.numberOfVotes || 0}
                    size="sm"
                    showStars={false}
                    prominent={true}
                  />
                  <div className={`flex items-center ${getRatingColor(userRatings[pokemon.id] || 0)}`}>
                    <ClientStarRating
                      value={userRatings[pokemon.id] || 0}
                      size="sm"
                      useColors={true}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}