'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Pokemon } from '@/types/pokemon';
import clientApi from '@/lib/api/client';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import PokemonGrid from './PokemonGrid';
import LoadingIndicator from './LoadingIndicator';
import EmptyState from './EmptyState';

export type SortCriteria = 'id' | 'name' | 'rating' | 'votes';
export type SortDirection = 'asc' | 'desc';
export type POKEMON_CATEGORY = 'favorite' | 'rated' | 'legendary' | 'mythical' | 'baby' | 'all';

// Définition des filtres
export interface PokemonFilters {
  search: string;
  types: string[];
  generations: number[];
  categories: POKEMON_CATEGORY[];
  minRating: number;
}

// Définition des générations de Pokémon avec leurs plages de Pokedex
export const GENERATIONS = [
  { id: 1, name: 'Génération I', range: [1, 151] },
  { id: 2, name: 'Génération II', range: [152, 251] },
  { id: 3, name: 'Génération III', range: [252, 386] },
  { id: 4, name: 'Génération IV', range: [387, 493] },
  { id: 5, name: 'Génération V', range: [494, 649] },
  { id: 6, name: 'Génération VI', range: [650, 721] },
  { id: 7, name: 'Génération VII', range: [722, 809] },
  { id: 8, name: 'Génération VIII', range: [810, 898] },
  { id: 9, name: 'Génération IX', range: [899, 1010] },
];

// Correction des props reçues (types est maintenant un tableau de chaînes)
interface ExplorerContainerProps {
  initialTypes: string[]; // Tableau de chaînes, pas d'objets
  totalCount: number;
}

const PAGE_SIZE = 20;

export default function ExplorerContainer({ initialTypes, totalCount }: ExplorerContainerProps) {
  // État pour les Pokémon et le filtrage
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [displayedPokemons, setDisplayedPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  
  // État pour la pagination et le chargement
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // État pour les filtres et le tri
  const [filters, setFilters] = useState<PokemonFilters>({
    search: '',
    types: [],
    generations: [],
    categories: [],
    minRating: 0,
  });
  const [sortOption, setSortOption] = useState<{
    criteria: SortCriteria;
    direction: SortDirection;
  }>({
    criteria: 'id',
    direction: 'asc',
  });
  
  // 3. Charger plus de Pokémon lors du défilement
  const loadMorePokemons = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const start = (nextPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      
      console.log(`Loading next batch: Page ${nextPage}, IDs ${start}-${end-1}`);
      
      // Récupérer le prochain lot de Pokémon filtrés
      const nextBatch = filteredPokemons.slice(start, end);
      if (nextBatch.length === 0) {
        setHasMore(false);
        return;
      }
      
      const pokemonIds = nextBatch.map(p => p.id);
      console.log("Fetching Pokémon IDs:", pokemonIds);
      
      // Charger les détails complets uniquement pour ce lot
      const detailedPokemons = await clientApi.pokemon.getByIds(pokemonIds);
      
      console.log("Received detailed Pokémon:", detailedPokemons.length);
      
      // Ajouter aux Pokémon affichés
      setDisplayedPokemons(prev => [...prev, ...detailedPokemons]);
      setPage(nextPage);
      setHasMore(end < filteredPokemons.length);
    } catch (error) {
      console.error('Error loading more Pokémon:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, filteredPokemons, page]);

  // Référence pour la détection de l'intersection (infinite scroll)
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPokemonElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log("Last element visible, loading more Pokémon...");
        loadMorePokemons();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMorePokemons]);
  
  // Recherche debounced pour éviter trop de requêtes
  const debouncedSearch = useDebounce(filters.search, 500);
  
  // 1. Premier chargement de métadonnées de tous les Pokémon
  useEffect(() => {
    async function loadAllPokemonMetadata() {
      setInitialLoading(true);
      try {
        // Charger uniquement les métadonnées (pas toutes les données) pour tous les Pokémon
        // Cela permet d'avoir un ensemble complet à filtrer
        const metadata = await clientApi.pokemon.getAllMetadata();
        setAllPokemons(metadata);
        setFilteredPokemons(metadata);
        
        // Charger les premières données complètes
        await loadInitialPokemons(metadata);
      } catch (error) {
        console.error('Error loading Pokémon metadata:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    
    loadAllPokemonMetadata();
  }, []);
  
  // 2. Chargement initial des premiers Pokémon
  async function loadInitialPokemons(pokemonList: Pokemon[]) {
    setLoading(true);
    try {
      // Prendre les premiers Pokémon selon le filtre actuel
      const initialSet = pokemonList.slice(0, PAGE_SIZE);
      
      // Charger les données complètes uniquement pour ce sous-ensemble
      const detailedPokemons = await clientApi.pokemon.getByIds(
        initialSet.map(p => p.id)
      );
      
      setDisplayedPokemons(detailedPokemons);
      setPage(1);
      setHasMore(detailedPokemons.length < pokemonList.length);
    } catch (error) {
      console.error('Error loading initial Pokémon:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // 4. Filtrer les Pokémon quand les filtres changent
  useEffect(() => {
    setSearchLoading(true);
    
    // Appliquer les filtres à la liste complète des métadonnées
    const applyFilters = () => {
      if (allPokemons.length === 0) return [];
      
      let result = [...allPokemons];
      
      // Filtre de recherche
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        result = result.filter(pokemon => {
          const idMatch = pokemon.id.toString().includes(searchLower);
          const nameMatch = pokemon.name.toLowerCase().includes(searchLower);
          return idMatch || nameMatch;
        });
      }
      
      // Filtre par types
      if (filters.types.length > 0) {
        result = result.filter(pokemon => {
          if (!pokemon.types) return false;
          return filters.types.some(type => 
            pokemon.types?.some(t => t.type.name === type)
          );
        });
      }
      
      // Filtre par génération
      if (filters.generations.length > 0) {
        result = result.filter(pokemon => {
          return filters.generations.some(genId => {
            const gen = GENERATIONS.find(g => g.id === genId);
            return gen && pokemon.id >= gen.range[0] && pokemon.id <= gen.range[1];
          });
        });
      }
      
      // Filtre par catégories spéciales
      // Note: Certaines catégories nécessitent des données spécifiques qui pourraient ne pas être disponibles dans les métadonnées
      
      // Filtre par note minimum
      if (filters.minRating > 0) {
        result = result.filter(pokemon => {
          return (pokemon.rating || 0) >= filters.minRating;
        });
      }
      
      return result;
    };
    
    // Trier les Pokémon filtrés
    const sortPokemons = (pokemons: Pokemon[]) => {
      return [...pokemons].sort((a, b) => {
        const factor = sortOption.direction === 'asc' ? 1 : -1;
        
        switch (sortOption.criteria) {
          case 'id':
            return factor * (a.id - b.id);
          case 'name':
            return factor * a.name.localeCompare(b.name);
          case 'rating':
            return factor * ((b.rating || 0) - (a.rating || 0));
          case 'votes':
            return factor * ((b.numberOfVotes || 0) - (a.numberOfVotes || 0));
          default:
            return 0;
        }
      });
    };
    
    // Appliquer filtres et tri
    const filtered = applyFilters();
    const sorted = sortPokemons(filtered);
    
    setFilteredPokemons(sorted);
    
    // Réinitialiser la pagination et charger les premiers résultats
    loadInitialPokemons(sorted);
    setSearchLoading(false);
  }, [debouncedSearch, filters.types, filters.generations, filters.categories, filters.minRating, sortOption, allPokemons]);
  
  // 5. Gestion des changements de filtres
  const handleFilterChange = (newFilters: Partial<PokemonFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // 6. Gestion des changements de tri
  const handleSortChange = (criteria: SortCriteria, direction?: SortDirection) => {
    if (criteria === sortOption.criteria && !direction) {
      // Toggle direction if clicking on same criteria
      setSortOption({
        criteria,
        direction: sortOption.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortOption({
        criteria,
        direction: direction || 'desc',
      });
    }
  };
  
  // 7. Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      search: '',
      types: [],
      generations: [],
      categories: [],
      minRating: 0,
    });
    setSortOption({
      criteria: 'id',
      direction: 'asc',
    });
  };
  
  const isFiltering = 
    filters.search !== '' || 
    filters.types.length > 0 || 
    filters.generations.length > 0 || 
    filters.categories.length > 0 || 
    filters.minRating > 0 ||
    sortOption.criteria !== 'id' ||
    sortOption.direction !== 'asc';
  
  return (
    <div className="animate-fade-in">
      {/* Barre de recherche et filtres */}
      <div className="mb-6">
        <SearchBar 
          value={filters.search} 
          onChange={value => handleFilterChange({ search: value })}
          loading={searchLoading}
        />
      </div>
      
      <div className="mb-6">
        <FilterPanel 
          filters={filters}
          sortOption={sortOption}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onReset={resetFilters}
          isFiltering={isFiltering}
          availableTypes={Array.isArray(initialTypes) ? initialTypes : []}
        />
      </div>
      
      <div className="border-t border-gray-800 pt-6">
        {initialLoading ? (
          <LoadingIndicator message="Chargement des Pokémon..." />
        ) : filteredPokemons.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <>
            {/* Affichage des résultats */}
            <div className="mb-4 text-sm text-gray-400">
              {filteredPokemons.length} résultat{filteredPokemons.length > 1 ? 's' : ''}
              {isFiltering && (
                <button 
                  onClick={resetFilters}
                  className="ml-2 text-blue-400 hover:text-blue-300 transition"
                >
                  Réinitialiser
                </button>
              )}
            </div>
            
            {/* Grille de Pokémon */}
            <PokemonGrid 
              pokemons={displayedPokemons}
              loading={loading}
              lastPokemonRef={lastPokemonElementRef} 
            />
            
            {/* Indicateur de chargement pour infinite scroll */}
            {loading && <LoadingIndicator message="Chargement..." />}
          </>
        )}
      </div>
    </div>
  );
}