'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/solid';
import { Pokemon } from '@/types/pokemon';
import SortControls from './SortControls';
import PokemonCardCollection from './PokemonCardCollection';
import ShowMoreButton from './ShowMoreButton';
import Link from 'next/link';

interface FavoritesSectionProps {
  pokemonList: Pokemon[];
  userRatings: Record<number, number>;
  pokemonCache: Record<number, { rating: number; numberOfVotes: number }>;
  favorites: number[];
}

const SORT_OPTIONS = [
  { id: 'userRating', label: 'My rating', activeClass: 'bg-amber-600' },
  { id: 'communityRating', label: 'Community', activeClass: 'bg-blue-600' },
  { id: 'votes', label: 'Votes', activeClass: 'bg-purple-600' },
];

/**
 * FavoritesSection component
 * Displays user's favorite Pokémon with sorting and view options
 * 
 * @param {Object} props - Component props
 * @param {Pokemon[]} props.pokemonList - List of favorite Pokémon
 * @param {Object} props.userRatings - Map of user's ratings by Pokémon ID
 * @param {Object} props.pokemonCache - Cache of community ratings/votes by Pokémon ID
 * @param {number[]} props.favorites - Array of user's favorite Pokémon IDs
 * @returns {JSX.Element} Section with favorite Pokémon and controls
 */
export default function FavoritesSection({ 
  pokemonList, 
  userRatings, 
  pokemonCache,
}: FavoritesSectionProps) {
  const [sortBy, setSortBy] = useState<'userRating' | 'communityRating' | 'votes'>('userRating');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Sorting method for favorites
  const sortedPokemons = useMemo(() => {
    return [...pokemonList].sort((a, b) => {
      const dirFactor = sortDir === 'asc' ? 1 : -1;

      switch (sortBy) {
        case 'userRating':
          return dirFactor * ((userRatings[b.id] || 0) - (userRatings[a.id] || 0));
        case 'communityRating':
          const aRating = pokemonCache[a.id]?.rating || a.rating || 0;
          const bRating = pokemonCache[b.id]?.rating || b.rating || 0;
          return dirFactor * (bRating - aRating);
        case 'votes':
          const aVotes = pokemonCache[a.id]?.numberOfVotes || a.numberOfVotes || 0;
          const bVotes = pokemonCache[b.id]?.numberOfVotes || b.numberOfVotes || 0;
          return dirFactor * (bVotes - aVotes);
        default:
          return 0;
      }
    });
  }, [pokemonList, sortBy, sortDir, userRatings, pokemonCache]);
  
  // Limit displayed favorites
  const displayedPokemons = showAll ? sortedPokemons : sortedPokemons.slice(0, viewMode === 'grid' ? 15 : 10);
  
  // Handle sort change
  const handleSortChange = (option: string, direction: 'asc' | 'desc') => {
    setSortBy(option as 'userRating' | 'communityRating' | 'votes');
    setSortDir(direction);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
          Your Favorites ({pokemonList.length})
        </h2>

        {pokemonList.length > 0 && (
          <SortControls
            sortBy={sortBy}
            sortDir={sortDir}
            options={SORT_OPTIONS}
            onSortChange={handleSortChange}
          />
        )}
      </div>

      {pokemonList.length > 0 ? (
        <div className="mb-6">
          <PokemonCardCollection
            pokemons={displayedPokemons}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {pokemonList.length > (viewMode === 'grid' ? 15 : 10) && (
            <ShowMoreButton
              isExpanded={showAll}
              itemCount={pokemonList.length}
              visibleCount={viewMode === 'grid' ? 15 : 10}
              onToggle={() => setShowAll(!showAll)}
            />
          )}
        </div>
      ) : (
        <motion.div 
          className="bg-gray-800/70 rounded-xl p-8 text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-400 mb-4">You haven't added any Pokémon to your favorites yet.</p>
          <Link href="/explorer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-block transition">
            Explore Pokémon
          </Link>
        </motion.div>
      )}
    </motion.section>
  );
}