'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import PokemonCard from '@/components/client/shared/PokemonCard';
import { api } from '@/lib/api';
import { 
  ArrowsUpDownIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

/**
 * Types for sorting options
 */
export type SortCriteria = 'rating' | 'votes';
export type SortDirection = 'asc' | 'desc';

/**
 * Props for the TopRatedContainer component
 */
interface TopRatedContainerProps {
  /** Initial list of top-rated Pokemon */
  initialPokemons: Pokemon[];
}

/**
 * TopRatedContainer component
 * 
 * Displays a list of top-rated Pokemon with filtering and sorting options.
 * Shows a podium for the top 3 Pokemon and a list for the rest.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function TopRatedContainer({ initialPokemons }: TopRatedContainerProps) {
  // States for sorting and filtering
  const [sortBy, setSortBy] = useState<SortCriteria>('rating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  
  // States for expandable filters
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isTypesExpanded, setIsTypesExpanded] = useState(false);
  const [isGenerationsExpanded, setIsGenerationsExpanded] = useState(false);

  // State for Pokemon
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>(initialPokemons);

  // Extract all unique types for filters
  const pokemonTypes = useMemo(() => {
    const types = new Set<string>();
    allPokemons.forEach(pokemon => {
      pokemon.types?.forEach(typeObj => {
        types.add(typeObj.type.name);
      });
    });
    return Array.from(types).sort();
  }, [allPokemons]);

  // Effect to refresh data after updates
  useEffect(() => {
    const refreshTopRated = async () => {
      try {
        const freshTopRated = await api.pokemon.getTopRated(50);
        setAllPokemons(freshTopRated);
      } catch (error) {
        console.error('Failed to refresh top rated Pokémon:', error);
      }
    };

    // Refresh data every 5 minutes
    const intervalId = setInterval(refreshTopRated, 300000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Filtering and sorting logic
  const displayedPokemons = useMemo(() => {
    // Apply filters
    const filtered = allPokemons.filter(pokemon => {
      // Filter by type - modified for exact match
      if (selectedTypes.length > 0) {
        const pokemonTypes = pokemon.types?.map(t => t.type.name) || [];
        
        // Check for exact match
        if (selectedTypes.length === 1) {
          // If only one type is selected, the Pokemon must have only this type
          if (pokemonTypes.length !== 1 || !pokemonTypes.includes(selectedTypes[0])) {
            return false;
          }
        } else if (selectedTypes.length === 2) {
          // If two types are selected, the Pokemon must have exactly these two types
          // (regardless of order)
          if (pokemonTypes.length !== 2 || 
              !selectedTypes.every(t => pokemonTypes.includes(t))) {
            return false;
          }
        }
      }

      // Filter by generation
      if (selectedGeneration !== null) {
        // More robust generation filtering using Pokemon ID ranges
        const generationRanges = [
          { start: 1, end: 151 },    // Gen 1
          { start: 152, end: 251 },  // Gen 2
          { start: 252, end: 386 },  // Gen 3
          { start: 387, end: 493 },  // Gen 4
          { start: 494, end: 649 },  // Gen 5
          { start: 650, end: 721 },  // Gen 6
          { start: 722, end: 809 },  // Gen 7
          { start: 810, end: 905 },  // Gen 8
          { start: 906, end: 1025 }  // Gen 9
        ];
        
        const targetRange = generationRanges[selectedGeneration];
        if (!targetRange || pokemon.id < targetRange.start || pokemon.id > targetRange.end) {
          return false;
        } 
      }

      return true;
    });

    // Apply sorting
    const directionFactor = sortDirection === 'asc' ? 1 : -1;
    
    return filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return directionFactor * ((a.rating || 0) - (b.rating || 0));
      } else { // votes
        return directionFactor * ((a.numberOfVotes || 0) - (b.numberOfVotes || 0));
      }
    });
  }, [allPokemons, selectedTypes, selectedGeneration, sortBy, sortDirection]);

  // Top 10 and podium/list separation
  const topTenPokemons = displayedPokemons.slice(0, 10);
  const podiumPokemons = topTenPokemons.slice(0, 3);
  const listPokemons = topTenPokemons.slice(3, 10);

  // Handler for changing sorting with intelligent defaults
  const handleSortChange = (criteria: SortCriteria) => {
    if (sortBy === criteria) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field: set default to descending for numeric fields (rating, votes)
      setSortBy(criteria);
      setSortDirection('desc');
    }
  };

  // Handler for type filters
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => {
      // If the type is already selected, remove it
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      
      // If two types are already selected, replace the oldest one (FIFO)
      if (prev.length >= 2) {
        return [...prev.slice(1), type]; // Remove the first, add the new one
      }
      
      // Otherwise simply add it
      return [...prev, type];
    });
  };

  // Handler for generation filters
  const handleGenerationChange = (genIndex: number | null) => {
    setSelectedGeneration(genIndex);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedGeneration(null);
    setSortBy('rating');
    setSortDirection('desc');
  };

  // Get the sort icon for a field
  const getSortIcon = (field: SortCriteria) => {
    if (field !== sortBy) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />;
    }
    
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4 text-blue-400" /> : 
      <ArrowDownIcon className="h-4 w-4 text-blue-400" />;
  };

  const isFiltering = selectedTypes.length > 0 || selectedGeneration !== null;
  const hasActiveFilters = selectedTypes.length > 0 || selectedGeneration !== null;

  return (
    <div className="space-y-6">
      {/* Filtering and sorting section - uniform style with ExplorerContainer */}
      <div className="mb-6">
        {/* Sorting options */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleSortChange('rating')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
              sortBy === 'rating' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Rating {getSortIcon('rating')}
          </button>
          
          <button
            onClick={() => handleSortChange('votes')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
              sortBy === 'votes' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Number of votes {getSortIcon('votes')}
          </button>
          
          {/* Button to show/hide filters */}
          <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ml-auto
              ${hasActiveFilters ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-white text-blue-600">
                {(selectedTypes.length > 0 ? 1 : 0) + (selectedGeneration !== null ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
        
        {/* Expandable filters section */}
        <AnimatePresence>
          {isFiltersExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-gray-850 rounded-lg p-4 space-y-4">
                {/* Expandable header for types */}
                <div>
                  <button
                    onClick={() => setIsTypesExpanded(!isTypesExpanded)} 
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-750 rounded-md text-left transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-200">Types</span>
                      {selectedTypes.length > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-600 text-white">
                          {selectedTypes.length}
                        </span>
                      )}
                    </div>
                    {isTypesExpanded ? 
                      <ChevronUpIcon className="h-4 w-4 text-gray-400" /> : 
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    }
                  </button>
                  
                  {/* Expandable content for types */}
                  <AnimatePresence>
                    {isTypesExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="pt-2 pb-1 px-1">
                          <div className="flex flex-wrap gap-2">
                            {pokemonTypes.map(type => {
                              const isSelected = selectedTypes.includes(type);
                              const isDisabled = selectedTypes.length >= 2 && !isSelected;
                              
                              return (
                                <button
                                  key={type}
                                  onClick={() => handleTypeToggle(type)}
                                  disabled={isDisabled}
                                  className={`px-3 py-1 rounded-md text-sm capitalize
                                    ${isSelected 
                                      ? 'bg-blue-600 text-white' 
                                      : isDisabled
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                    }`}
                                >
                                  {type}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Expandable header for generations */}
                <div>
                  <button
                    onClick={() => setIsGenerationsExpanded(!isGenerationsExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-750 rounded-md text-left transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-200">Generation</span>
                      {selectedGeneration !== null && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-600 text-white">
                          1
                        </span>
                      )}
                    </div>
                    {isGenerationsExpanded ? 
                      <ChevronUpIcon className="h-4 w-4 text-gray-400" /> : 
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    }
                  </button>
                  
                  {/* Expandable content for generations */}
                  <AnimatePresence>
                    {isGenerationsExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="pt-2 pb-1 px-1">
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 9 }, (_, index) => ({
                              name: `Generation ${index + 1}`,
                              index
                            })).map((gen, index) => (
                              <button
                                key={gen.name}
                                onClick={() => handleGenerationChange(selectedGeneration === index ? null : index)}
                                className={`px-3 py-1 rounded-md text-sm
                                  ${selectedGeneration === index 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                              >
                                {gen.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Results and reset button */}
        {isFiltering && (
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              {displayedPokemons.length} result{displayedPokemons.length > 1 ? 's' : ''}
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Podium section (Top 3) - unchanged */}
      <section>
        <h2 className="text-2xl font-bold mb-6">The podium</h2>
        
        {podiumPokemons.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No Pokémon match the filters
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Position 2 (silver) */}
            {podiumPokemons.length >= 2 && (
              <RankedPokemonCard 
                pokemon={podiumPokemons[1]} 
                rank={2}
              />
            )}
            
            {/* Position 1 (gold) */}
            {podiumPokemons.length >= 1 && (
              <RankedPokemonCard 
                pokemon={podiumPokemons[0]} 
                rank={1}
              />
            )}
            
            {/* Position 3 (bronze) */}
            {podiumPokemons.length >= 3 && (
              <RankedPokemonCard 
                pokemon={podiumPokemons[2]} 
                rank={3}
              />
            )}
          </div>
        )}
      </section>

      {/* List section (Top 4-10) */}
      {listPokemons.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Ranking 4-10</h2>
          
          <div className="space-y-4">
            {listPokemons.map((pokemon, index) => (
              <RankedPokemonCard 
                key={pokemon.id}
                pokemon={pokemon} 
                rank={index + 4}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Props for the RankedPokemonCard component
 */
interface RankedPokemonCardProps {
  /** Pokemon to display */
  pokemon: Pokemon;
  /** Ranking position (1-10) */
  rank: number;
}

/**
 * RankedPokemonCard component
 * 
 * Displays a Pokemon card with ranking information.
 * Different styles are applied based on the ranking position.
 * 
 * @param props - Component props
 * @returns React component
 */
function RankedPokemonCard({ pokemon, rank }: RankedPokemonCardProps) {
  // Rank-specific configurations
  const rankConfig = {
    1: {
      colorClass: 'from-yellow-300 to-amber-500',
      borderColor: 'border-yellow-500',
      shadowColor: 'shadow-amber-500/30',
      order: 'order-first md:order-none',
    },
    2: {
      colorClass: 'from-gray-300 to-slate-400',
      borderColor: 'border-gray-400',
      shadowColor: 'shadow-slate-400/30',
      order: 'order-none',
      scale: ''
    },
    3: {
      colorClass: 'from-amber-700 to-orange-800',
      borderColor: 'border-amber-700',
      shadowColor: 'shadow-amber-700/30',
      order: 'order-none',
      scale: ''
    }
  };

  // For positions 1, 2, 3 (podium)
  if (rank <= 3) {
    const config = rankConfig[rank as 1|2|3];
    
    return (
      <motion.div 
        className={`${config.order} ${rank === 1 ? 'md:mt-0' : 'md:mt-8'} relative`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.2, duration: 0.5 }}
      >
        
        {/* Card with shiny border and shadow */}
        <div className={`relative transform transition-all duration-300`}>
          {/* Glow effect behind the card */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.colorClass} blur-lg opacity-25 rounded-xl`}></div>
          
          <motion.div 
            className={`rounded-xl p-1.5 bg-gradient-to-br ${config.colorClass} shadow-xl ${config.shadowColor}`}
            whileHover={{ 
              boxShadow: `0 0 25px 2px rgba(255,255,255,0.2)`,
              scale: 1.02
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <PokemonCard
                pokemon={pokemon}
                size="md"
                viewMode="grid"
                showActions={true}
                showRating={true}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }
  
  // For positions 4-10 (list)
  // Calculate opacity based on position (lower = less opaque)
  const opacity = Math.max(0.6, 1 - (rank - 3) * 0.1).toFixed(1);
  
  return (
          <motion.div 
      className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg"
      style={{ opacity }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + (rank - 4) * 0.1 }}
      whileHover={{ 
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        scale: 1.01
      }}
    >
      <div className="flex items-center flex-col sm:flex-row">
        {/* Minimalist rank indicator */}
        <div className="w-full sm:w-16 py-2 sm:py-0 sm:h-full bg-gray-800 flex-shrink-0 flex items-center justify-center">
          <span className="text-base font-semibold text-gray-400">
            #{rank}
          </span>
        </div>
        
        {/* List version of PokemonCard */}
        <div className="w-full flex-grow">
          <PokemonCard
            pokemon={pokemon}
            viewMode="list"
            size="md"
            showActions={true}
            showRating={true}
          />
        </div>
      </div>
    </motion.div>
  );
}