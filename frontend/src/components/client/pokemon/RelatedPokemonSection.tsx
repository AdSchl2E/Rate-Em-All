'use client';

import { motion } from 'framer-motion';
import { usePokemonByType } from '@/hooks/usePokemonByType';
import PokemonCard from '@/components/client/shared/PokemonCard';

interface RelatedPokemonSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentPokemon: any;
  currentPokemonId: number;
}

/**
 * RelatedPokemonSection component
 * Shows other Pokemon with the same type as the current Pokemon
 */
export default function RelatedPokemonSection({ 
  currentPokemon, 
  currentPokemonId 
}: RelatedPokemonSectionProps) {
  const primaryType = currentPokemon?.types?.[0]?.type?.name;
  
  const { pokemon: relatedPokemon, loading, error } = usePokemonByType({
    type: primaryType,
    limit: 20,
    enabled: !!primaryType
  });

  // Filter out the current Pokemon and limit to 8 results
  const filteredPokemon = relatedPokemon
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((pokemon: any) => pokemon.id !== currentPokemonId)
    .slice(0, 8);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">
          Other {primaryType} Pokemon
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-lg p-4 animate-pulse"
            >
              <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-1"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || filteredPokemon.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-bold text-white capitalize">
        Other {primaryType} Pokemon
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredPokemon.map((pokemon) => (
          <motion.div
            key={pokemon.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <PokemonCard 
              pokemon={pokemon}
              viewMode="grid"
              showActions={true}
              showRating={true}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
