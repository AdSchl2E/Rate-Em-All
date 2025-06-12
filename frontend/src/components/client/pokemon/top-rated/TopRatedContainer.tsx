'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGlobal } from '@/providers/GlobalProvider';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import clientApi from '@/lib/api/client';

import PodiumSection from './PodiumSection';
import RankingList from './RankingList';
import SortingControls from './SortingControls';
import FilterPanel from './FilterPanel';

// Types pour les options de tri et filtrage
export type SortCriteria = 'rating' | 'votes' | 'name';
export type SortDirection = 'asc' | 'desc';

interface TopRatedContainerProps {
  initialPokemons: Pokemon[];
}

export default function TopRatedContainer({ initialPokemons }: TopRatedContainerProps) {
  const [sortBy, setSortBy] = useState<SortCriteria>('rating');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { pokemonCache, userRatings, favorites } = useGlobal();
  const { data: session } = useSession();

  // État pour les Pokémon et leurs mises à jour
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>(initialPokemons);
  const [lastRatingTimestamp, setLastRatingTimestamp] = useState<number>(0);

  // Effet pour rafraîchir les données après une nouvelle notation
  useEffect(() => {
    const refreshTopRated = async () => {
      if (lastRatingTimestamp > 0) {
        try {
          console.log('Refreshing top rated Pokémon after new rating');
          const freshTopRated = await clientApi.pokemon.getTopRated(50);
          setAllPokemons(freshTopRated);
        } catch (error) {
          console.error('Failed to refresh top rated Pokémon:', error);
        }
      }
    };

    refreshTopRated();
  }, [lastRatingTimestamp]);

  // Observer les changements de notation utilisateur
  useEffect(() => {
    setLastRatingTimestamp(Date.now());
  }, [userRatings]);

  // Préparer les Pokémon avec les données du cache
  const enhancedPokemons = useMemo(() => {
    return allPokemons.map(pokemon => ({
      ...pokemon,
      rating: pokemonCache[pokemon.id]?.rating ?? pokemon.rating,
      numberOfVotes: pokemonCache[pokemon.id]?.numberOfVotes ?? pokemon.numberOfVotes
    }));
  }, [allPokemons, pokemonCache]);

  // Gestionnaire pour changer le tri
  const handleSortChange = (criteria: SortCriteria) => {
    if (sortBy === criteria) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      // Par défaut: tri décroissant pour rating et votes, croissant pour name
      setSortDirection(criteria === 'name' ? 'asc' : 'desc');
    }
  };

  // Gestionnaires de filtres
  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleGeneration = (genIndex: number) => {
    setSelectedGenerations(prev =>
      prev.includes(genIndex) ? prev.filter(g => g !== genIndex) : [...prev, genIndex]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedGenerations([]);
    setSelectedCategories([]);
    setMinRating(null);
    setSortBy('rating');
    setSortDirection('desc');
  };

  // Logique de filtrage et tri
  const displayedPokemons = useMemo(() => {
    // Extraction des types uniques pour le filtre
    const pokemonTypes = Array.from(
      new Set(
        allPokemons.flatMap(pokemon => 
          pokemon.types?.map(typeObj => typeObj.type.name) || []
        )
      )
    ).sort();
    
    // Filter logic...
    let filtered = enhancedPokemons.filter(pokemon => {
      // Type filter
      if (selectedTypes.length > 0) {
        const pokemonTypes = pokemon.types?.map(t => t.type.name) || [];
        if (!selectedTypes.every(type => pokemonTypes.includes(type))) {
          return false;
        }
      }

      // Generation filter
      if (selectedGenerations.length > 0) {
        const genMatch = selectedGenerations.some(genIndex => {
          const gen = GENERATIONS[genIndex];
          return pokemon.id >= gen.range[0] && pokemon.id <= gen.range[1];
        });
        if (!genMatch) return false;
      }

      // Special categories filter (légendaire, starter, etc.)
      if (selectedCategories.length > 0) {
        // Maps des catégories spéciales de Pokémon par ID
        const legendaryIds = [144, 145, 146, 150, 243, 244, 245, /* ... plus IDs ... */];
        const mythicalIds = [151, 251, 385, 386, /* ... plus IDs ... */];
        const starterIds = [1, 4, 7, 152, /* ... plus IDs ... */];

        const isLegendary = legendaryIds.includes(pokemon.id);
        const isMythical = mythicalIds.includes(pokemon.id);
        const isStarter = starterIds.includes(pokemon.id);

        const pokemonName = pokemon.name.toLowerCase();
        const isMega = pokemonName.includes('mega');
        const isGmax = pokemonName.includes('gmax') || pokemonName.includes('gigantamax');
        const isAlolan = pokemonName.includes('-alola');
        const isGalarian = pokemonName.includes('-galar');
        const isHisuian = pokemonName.includes('-hisui');

        const categoryMatches = {
          legendary: isLegendary,
          mythical: isMythical,
          starter: isStarter,
          mega: isMega,
          gmax: isGmax,
          alolan: isAlolan,
          galarian: isGalarian,
          hisuian: isHisuian
        };

        if (!selectedCategories.some(cat => categoryMatches[cat as keyof typeof categoryMatches])) {
          return false;
        }
      }

      // Rating filter
      if (minRating !== null) {
        const pokemonRating = pokemon.rating || 0;
        if (pokemonRating < minRating) return false;
      }

      return true;
    });

    // Logique de tri
    const directionFactor = sortDirection === 'asc' ? 1 : -1;
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return directionFactor * ((a.rating || 0) - (b.rating || 0));
        case 'votes':
          return directionFactor * ((a.numberOfVotes || 0) - (b.numberOfVotes || 0));
        case 'name':
          return directionFactor * a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [enhancedPokemons, selectedTypes, selectedGenerations, selectedCategories, minRating, sortBy, sortDirection]);

  // Top 10 et séparation podium/liste
  const topTenPokemons = displayedPokemons.slice(0, 10);
  const podiumPokemons = topTenPokemons.slice(0, 3);
  const listPokemons = topTenPokemons.slice(3);

  const isFiltering = selectedTypes.length > 0 ||
    selectedGenerations.length > 0 ||
    selectedCategories.length > 0 ||
    minRating !== null;

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

  return (
    <motion.div className="mt-12 animate-fade-in">
      {/* Contrôles de tri et filtres */}
      <SortingControls 
        sortBy={sortBy}
        sortDirection={sortDirection}
        handleSortChange={handleSortChange}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isFiltering={isFiltering}
        filterCount={selectedTypes.length + selectedGenerations.length + selectedCategories.length + (minRating !== null ? 1 : 0)}
      />
      
      {/* Panneau de filtres (affiché conditionnellement) */}
      {showFilters && (
        <FilterPanel 
          pokemonTypes={pokemonTypes}
          selectedTypes={selectedTypes}
          selectedGenerations={selectedGenerations}
          selectedCategories={selectedCategories}
          minRating={minRating}
          setMinRating={setMinRating}
          toggleType={toggleType}
          toggleGeneration={toggleGeneration}
          toggleCategory={toggleCategory}
          resetFilters={resetFilters}
        />
      )}

      {/* Podium des 3 premiers */}
      {podiumPokemons.length > 0 && (
        <PodiumSection 
          podiumPokemons={podiumPokemons} 
          userRatings={userRatings}
          favorites={favorites}
        />
      )}

      {/* Liste des positions 4-10 */}
      {listPokemons.length > 0 && (
        <RankingList 
          pokemons={listPokemons} 
          startRank={4}
          userRatings={userRatings}
          favorites={favorites}
        />
      )}
    </motion.div>
  );
}

// Constants
const GENERATIONS = [
  { name: 'Génération I', range: [1, 151] },
  { name: 'Génération II', range: [152, 251] },
  { name: 'Génération III', range: [252, 386] },
  { name: 'Génération IV', range: [387, 493] },
  { name: 'Génération V', range: [494, 649] },
  { name: 'Génération VI', range: [650, 721] },
  { name: 'Génération VII', range: [722, 809] },
  { name: 'Génération VIII', range: [810, 898] },
  { name: 'Génération IX', range: [899, 1010] },
];

export const SPECIAL_CATEGORIES = [
  { id: 'legendary', name: 'Légendaire' },
  { id: 'mythical', name: 'Mythique' },
  { id: 'starter', name: 'Starter' },
  { id: 'mega', name: 'Méga-Évolution' },
  { id: 'gmax', name: 'Gigamax' },
  { id: 'alolan', name: "Forme d'Alola" },
  { id: 'galarian', name: 'Forme de Galar' },
  { id: 'hisuian', name: 'Forme de Hisui' }
];