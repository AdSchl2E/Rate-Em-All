'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import PokemonCard from '@/components/client/shared/PokemonCard';
import type { ViewMode } from './ExplorerContainer';

interface PokemonGridProps {
  pokemons: Pokemon[];
  loading?: boolean;
  lastPokemonRef: (node: HTMLElement | null) => void;
  viewMode: ViewMode;
}

/**
 * PokemonGrid component
 * Renders a grid or list of Pokémon cards with animations
 * 
 * @param {Object} props - Component props
 * @param {Pokemon[]} props.pokemons - Array of Pokémon to display
 * @param {boolean} [props.loading] - Loading state flag
 * @param {Function} props.lastPokemonRef - Ref callback for the last element (infinite scroll)
 * @param {ViewMode} props.viewMode - Display mode ('grid' or 'list')
 */
export default function PokemonGrid({ pokemons, loading, lastPokemonRef, viewMode }: PokemonGridProps) {
  // Ensure pokemons is always an array
  const pokemonArray: Pokemon[] = Array.isArray(pokemons) ? pokemons : [];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: viewMode === 'grid' ? 0.05 : 0.03
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10
      }
    }
  };
  
  if (pokemonArray.length === 0 && !loading) {
    return <div className="text-center py-8 text-gray-400">No Pokémon match your criteria</div>;
  }

  console.log(`Rendering PokemonGrid in ${viewMode} mode with ${pokemonArray.length} Pokémon`);
  
  return (
    <motion.div
      className={viewMode === 'grid' 
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
        : "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2"
      }
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {pokemonArray.map((pokemon: Pokemon, index: number) => {
        // Reference for the last item (infinite scroll)
        const isLastItem: boolean = index === pokemonArray.length - 1;
        
        return (
          <motion.div 
            key={pokemon.id}
            variants={itemVariants}
            // Reference for infinite scroll
            ref={isLastItem ? node => {
              console.log("Setting ref on last Pokémon:", pokemon.id);
              lastPokemonRef(node);
            } : null}
          >
            <PokemonCard 
              pokemon={pokemon} 
              showActions={true} 
              showRating={true} 
              viewMode={viewMode}
              size={viewMode === 'list' ? 'sm' : 'md'} // Small size for list mode in explorer
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}