'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import PokemonCard from '@/components/client/shared/PokemonCard';
import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

interface PokemonCardCollectionProps {
  pokemons: Pokemon[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function PokemonCardCollection({
  pokemons,
  viewMode,
  onViewModeChange
}: PokemonCardCollectionProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: viewMode === 'grid' ? 0.05 : 0.03,
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
    <div>
      {/* View mode toggle */}
      <div className="flex justify-end mb-3">
        <div className="bg-gray-800 rounded-lg p-1 inline-flex">
          <button
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => onViewModeChange('grid')}
            title="Affichage en grille"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => onViewModeChange('list')}
            title="Affichage en liste"
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    
      {/* Pokemon collection */}
      <motion.div
        className={viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
          : "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2"
        }
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {pokemons.map(pokemon => (
          <motion.div key={pokemon.id} variants={itemVariants}>
            <PokemonCard 
              pokemon={pokemon} 
              showActions={true}
              showRating={true}
              viewMode={viewMode}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}