'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { Pokemon } from '@/types/pokemon';
import SortControls from './SortControls';
import PokemonCardCollection from './PokemonCardCollection';
import ShowMoreButton from './ShowMoreButton';
import Link from 'next/link';

interface RatedPokemonsSectionProps {
  pokemonList: Pokemon[];
  userRatings: Record<number, number>;
  pokemonCache: Record<number, { rating: number; numberOfVotes: number }>;
  favorites: number[];
}

const SORT_OPTIONS = [
  { id: 'userRating', label: 'Ma note', activeClass: 'bg-amber-600' },
  { id: 'communityRating', label: 'Commu.', activeClass: 'bg-blue-600' },
  { id: 'votes', label: 'Votes', activeClass: 'bg-purple-600' },
];

export default function RatedPokemonsSection({ 
  pokemonList, 
  userRatings, 
  pokemonCache,
  favorites
}: RatedPokemonsSectionProps) {
  const [sortBy, setSortBy] = useState<'userRating' | 'communityRating' | 'votes'>('userRating');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Méthode de tri
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
  
  // Limiter les Pokémon affichés
  const displayedPokemons = showAll ? sortedPokemons : sortedPokemons.slice(0, viewMode === 'grid' ? 20 : 15);
  
  // Gérer le changement de tri
  const handleSortChange = (option: string, direction: 'asc' | 'desc') => {
    setSortBy(option as any);
    setSortDir(direction);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <StarIcon className="h-6 w-6 mr-2 text-amber-500" />
          Vos Notes ({pokemonList.length})
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
        <div>
          <PokemonCardCollection
            pokemons={displayedPokemons}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {pokemonList.length > (viewMode === 'grid' ? 20 : 15) && (
            <ShowMoreButton
              isExpanded={showAll}
              itemCount={pokemonList.length}
              visibleCount={viewMode === 'grid' ? 20 : 15}
              onToggle={() => setShowAll(!showAll)}
            />
          )}
        </div>
      ) : (
        <motion.div 
          className="bg-gray-800/70 rounded-xl p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-400 mb-4">Vous n'avez pas encore noté de Pokémon.</p>
          <Link href="/explorer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-block transition">
            Noter des Pokémon
          </Link>
        </motion.div>
      )}
    </motion.section>
  );
}