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

export default function PokemonGrid({ pokemons, loading, lastPokemonRef, viewMode }: PokemonGridProps) {
  // S'assurer que pokemons est toujours un tableau
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
    return <div className="text-center py-8 text-gray-400">Aucun Pokémon ne correspond à vos critères</div>;
  }

  console.log(`Rendering PokemonGrid in ${viewMode} mode with ${pokemonArray.length} Pokémon`);
  
  return (
    <motion.div
      className={viewMode === 'grid' 
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
        : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2"
      }
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {pokemonArray.map((pokemon: Pokemon, index: number) => {
        // Référence pour le dernier élément (infinite scroll)
        const isLastItem: boolean = index === pokemonArray.length - 1;
        
        return (
          <motion.div 
            key={pokemon.id}
            variants={itemVariants}
            // Référence pour l'infinite scroll
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
              size={viewMode === 'list' ? 'sm' : 'md'} // Taille 'sm' pour le mode liste dans l'explorateur
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}