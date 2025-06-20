'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGlobal } from '@/providers/GlobalProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import PokemonCard from '@/components/client/shared/PokemonCard';
import clientApi from '@/lib/api/client';
import { 
  ArrowsUpDownIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

// Types pour les options de tri
export type SortCriteria = 'rating' | 'votes';
export type SortDirection = 'asc' | 'desc';

interface TopRatedContainerProps {
  initialPokemons: Pokemon[];
}

export default function TopRatedContainer({ initialPokemons }: TopRatedContainerProps) {
  // États pour le tri et le filtrage
  const [sortBy, setSortBy] = useState<SortCriteria>('rating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  
  // États pour les filtres dépliables
  const [isTypesExpanded, setIsTypesExpanded] = useState(false);
  const [isGenerationsExpanded, setIsGenerationsExpanded] = useState(false);

  // État pour les Pokémon
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>(initialPokemons);

  // Extraire tous les types uniques pour les filtres
  const pokemonTypes = useMemo(() => {
    const types = new Set<string>();
    allPokemons.forEach(pokemon => {
      pokemon.types?.forEach(typeObj => {
        types.add(typeObj.type.name);
      });
    });
    return Array.from(types).sort();
  }, [allPokemons]);

  // Effet pour rafraîchir les données après des mises à jour
  useEffect(() => {
    const refreshTopRated = async () => {
      try {
        const freshTopRated = await clientApi.pokemon.getTopRated(50);
        setAllPokemons(freshTopRated);
      } catch (error) {
        console.error('Failed to refresh top rated Pokémon:', error);
      }
    };

    // Rafraîchir les données toutes les 5 minutes
    const intervalId = setInterval(refreshTopRated, 300000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Logique de filtrage et tri
  const displayedPokemons = useMemo(() => {
    // Appliquer les filtres
    let filtered = allPokemons.filter(pokemon => {
      // Filtre par type - modification pour correspondance exacte
      if (selectedTypes.length > 0) {
        const pokemonTypes = pokemon.types?.map(t => t.type.name) || [];
        
        // Vérifier la correspondance exacte
        if (selectedTypes.length === 1) {
          // Si un seul type est sélectionné, le Pokémon doit être uniquement de ce type
          if (pokemonTypes.length !== 1 || !pokemonTypes.includes(selectedTypes[0])) {
            return false;
          }
        } else if (selectedTypes.length === 2) {
          // Si deux types sont sélectionnés, le Pokémon doit avoir exactement ces deux types
          // (sans tenir compte de l'ordre)
          if (pokemonTypes.length !== 2 || 
              !selectedTypes.every(t => pokemonTypes.includes(t))) {
            return false;
          }
        }
      }

      // Filtre par génération
      if (selectedGeneration !== null) {
        const gen = pokemon.species_info?.generation?.url.split('/')[6]; 
        if (!gen || !gen.includes(`${selectedGeneration + 1}`)) {
          return false;
        } 
      }

      return true;
    });

    // Appliquer le tri
    const directionFactor = sortDirection === 'asc' ? 1 : -1;
    
    return filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return directionFactor * ((a.rating || 0) - (b.rating || 0));
      } else { // votes
        return directionFactor * ((a.numberOfVotes || 0) - (b.numberOfVotes || 0));
      }
    });
  }, [allPokemons, selectedTypes, selectedGeneration, sortBy, sortDirection]);

  // Top 10 et séparation podium/liste
  const topTenPokemons = displayedPokemons.slice(0, 10);
  const podiumPokemons = topTenPokemons.slice(0, 3);
  const listPokemons = topTenPokemons.slice(3, 10);

  // Gestionnaire pour changer le tri
  const handleSortChange = (criteria: SortCriteria) => {
    if (sortBy === criteria) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortDirection('desc');
    }
  };

  // Gestionnaire pour les filtres de type
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => {
      // Si le type est déjà sélectionné, on le retire
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      
      // Si on a déjà 2 types sélectionnés, on remplace le plus ancien (FIFO)
      if (prev.length >= 2) {
        return [...prev.slice(1), type]; // Retire le premier, ajoute le nouveau
      }
      
      // Sinon on l'ajoute simplement
      return [...prev, type];
    });
  };

  // Gestionnaire pour les filtres de génération
  const handleGenerationChange = (genIndex: number | null) => {
    setSelectedGeneration(genIndex);
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedGeneration(null);
    setSortBy('rating');
    setSortDirection('desc');
  };

  // Obtenir l'icône de tri pour un champ donné
  const getSortIcon = (field: SortCriteria) => {
    if (field !== sortBy) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />;
    }
    
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4 text-blue-400" /> : 
      <ArrowDownIcon className="h-4 w-4 text-blue-400" />;
  };

  const isFiltering = selectedTypes.length > 0 || selectedGeneration !== null;

  return (
    <div className="space-y-6">
      {/* Section de filtres et tri - style uniforme avec ExplorerContainer */}
      <div className="mb-6">
        {/* Options de tri */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleSortChange('rating')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
              sortBy === 'rating' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Note {getSortIcon('rating')}
          </button>
          
          <button
            onClick={() => handleSortChange('votes')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
              sortBy === 'votes' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Nombre de votes {getSortIcon('votes')}
          </button>
        </div>
        
        {/* En-tête dépliable pour les types */}
        <div className="mb-2">
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
        </div>
        
        {/* Contenu dépliable pour les types */}
        <AnimatePresence>
          {isTypesExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-4"
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
                        className={`px-3 py-1 rounded-full text-sm capitalize
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
        
        {/* En-tête dépliable pour les générations */}
        <div className="mb-2">
          <button
            onClick={() => setIsGenerationsExpanded(!isGenerationsExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-750 rounded-md text-left transition-colors"
          >
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-200">Génération</span>
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
        </div>
        
        {/* Contenu dépliable pour les générations */}
        <AnimatePresence>
          {isGenerationsExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-4"
            >
              <div className="pt-2 pb-1 px-1">
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 9 }, (_, index) => ({
                    name: `Génération ${index + 1}`,
                    index
                  })).map((gen, index) => (
                    <button
                      key={gen.name}
                      onClick={() => handleGenerationChange(selectedGeneration === index ? null : index)}
                      className={`px-3 py-1 rounded-full text-sm
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
        
        {/* Résultats et bouton de réinitialisation */}
        {isFiltering && (
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              {displayedPokemons.length} résultat{displayedPokemons.length > 1 ? 's' : ''}
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Section du podium (Top 3) */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Le podium</h2>
        
        {podiumPokemons.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Aucun Pokémon correspondant aux filtres
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Position 2 (argent) */}
            {podiumPokemons.length >= 2 && (
              <RankedPokemonCard 
                pokemon={podiumPokemons[1]} 
                rank={2}
              />
            )}
            
            {/* Position 1 (or) */}
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

      {/* Section liste (Top 4-10) */}
      {listPokemons.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Classement 4-10</h2>
          
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

// Le composant RankedPokemonCard reste inchangé
function RankedPokemonCard({ pokemon, rank }: { 
  pokemon: Pokemon; 
  rank: number;
}) {
  // Configurations spécifiques au rang
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

  // Pour les positions 1, 2, 3 (podium)
  if (rank <= 3) {
    const config = rankConfig[rank as 1|2|3];
    
    return (
      <motion.div 
        className={`${config.order} ${rank === 1 ? 'md:mt-0' : 'md:mt-8'} relative`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.2, duration: 0.5 }}
      >
        
        {/* Card avec bordure brillante et ombre */}
        <div className={`relative transform transition-all duration-300`}>
          {/* Effet de lueur derrière la carte */}
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
  
  // Pour les positions 4-10 (liste)
  // Calculer l'opacité en fonction de la position (plus bas = moins opaque)
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
      <div className="flex items-center">
        {/* Indicateur de rang minimaliste */}
        <div className="w-16 h-full bg-gray-800 flex-shrink-0 flex items-center justify-center">
          <span className="text-base font-semibold text-gray-400">
            #{rank}
          </span>
        </div>
        
        {/* Version liste du PokemonCard */}
        <div className="flex-grow">
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