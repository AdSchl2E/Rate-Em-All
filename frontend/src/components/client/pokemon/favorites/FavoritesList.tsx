'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import PokemonCard from '../../shared/PokemonCard';
import { 
  ArrowsUpDownIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  Squares2X2Icon, 
  ListBulletIcon 
} from '@heroicons/react/24/outline';

interface FavoritesListProps {
  pokemons: Pokemon[];
}

type ViewMode = 'grid' | 'list';
type SortMode = 'id' | 'name' | 'rating';

/**
 * FavoritesList component
 * Displays and organizes favorite Pokémon with sorting and view mode options
 * 
 * @param {Object} props - Component props
 * @param {Pokemon[]} props.pokemons - Array of favorite Pokémon to display
 * @returns {JSX.Element} Pokémon list with sorting and view controls
 */
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

  /**
   * Get appropriate sort icon for a sorting field
   * @param {SortMode} field - Sorting field to check
   * @returns {JSX.Element} Icon component for current sort state
   */
  const getSortIcon = (field: SortMode) => {
    if (field !== sortMode) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />;
    }
    
    return field === 'rating' ? 
      <ArrowDownIcon className="h-4 w-4 text-blue-400" /> : 
      <ArrowUpIcon className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <p className="text-gray-400">{pokemons.length} favorite Pokémon</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* Sort Controls */}
          <div className="flex gap-2">
            <button 
              onClick={() => setSortMode('id')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
                sortMode === 'id' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
              }`}
            >
              ID {getSortIcon('id')}
            </button>
            <button 
              onClick={() => setSortMode('name')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
                sortMode === 'name' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
              }`}
            >
              Name {getSortIcon('name')}
            </button>
            <button 
              onClick={() => setSortMode('rating')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
                sortMode === 'rating' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
              }`}
            >
              Rating {getSortIcon('rating')}
            </button>
          </div>
          
          {/* View Mode Controls - Same style as ExplorerContainer */}
          <div className="bg-gray-800 rounded-lg p-1 inline-flex">
            <button
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setViewMode('list')}
              title="List view"
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