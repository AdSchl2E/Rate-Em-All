'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import PokemonCard from '../../shared/PokemonCard';
import { BarsArrowDownIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

interface FavoritesListProps {
  pokemons: Pokemon[];
}

type ViewMode = 'grid' | 'list';
type SortMode = 'id' | 'name' | 'rating';

export default function FavoritesList({ pokemons }: FavoritesListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('id');

  // Sorting logic
  const sortedPokemons = [...pokemons].sort((a, b) => {
    switch (sortMode) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'id':
      default:
        return a.id - b.id;
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-400">{pokemons.length} Pokémon favoris</p>
        </div>
        
        <div className="flex space-x-3">
          {/* Sort Controls */}
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button 
              onClick={() => setSortMode('id')}
              className={`px-3 py-1.5 text-sm flex items-center ${sortMode === 'id' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              #ID
            </button>
            <button 
              onClick={() => setSortMode('name')}
              className={`px-3 py-1.5 text-sm flex items-center ${sortMode === 'name' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              A-Z
            </button>
            <button 
              onClick={() => setSortMode('rating')}
              className={`px-3 py-1.5 text-sm flex items-center ${sortMode === 'rating' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <BarsArrowDownIcon className="h-4 w-4 mr-1" />
              Note
            </button>
          </div>
          
          {/* View Mode Controls */}
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 flex items-center ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 flex items-center ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Pokémon Grid or List */}
      <motion.div 
        className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          : "divide-y divide-gray-800 space-y-3"
        }
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sortedPokemons.map((pokemon) => (
          <motion.div key={pokemon.id} variants={childVariants}>
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