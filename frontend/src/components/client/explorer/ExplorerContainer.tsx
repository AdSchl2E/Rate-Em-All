'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Pokemon } from '@/types/pokemon';
import clientApi from '@/lib/api/client';
import SearchBar from './SearchBar';
import PokemonGrid from './PokemonGrid';
import LoadingIndicator from './LoadingIndicator';
import EmptyState from './EmptyState';
import { useGlobal } from '@/providers/GlobalProvider';
import { 
  ListBulletIcon, 
  Squares2X2Icon, 
  HeartIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';

/**
 * View mode for the Pokemon display
 */
export type ViewMode = 'grid' | 'list';

/**
 * Sort field options for Pokemon list
 */
export type SortField = 'id' | 'name' | 'rating' | 'numberOfVotes' | 'userRating';

/**
 * Sort direction options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Number of Pokemon to load per page
 */
const PAGE_SIZE = 20;

/**
 * Props for the ExplorerContainer component
 */
interface ExplorerContainerProps {
  /** Initial list of Pokemon types */
  initialTypes: string[];
  /** Total count of Pokemon in the database */
  totalCount: number;
}

/**
 * ExplorerContainer component
 * 
 * Main container for the Pokemon explorer page.
 * Handles loading, filtering, sorting, and displaying Pokemon.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function ExplorerContainer({ initialTypes, totalCount }: ExplorerContainerProps) {
  // States for Pokemon and filtering
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [displayedPokemons, setDisplayedPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  
  // States for pagination and loading
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for display mode
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // States for sorting and favorite filters
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Get global context to access favorites
  const { favorites, userRatings, isFavorite, getRating } = useGlobal();
  
  // Load more Pokemon when scrolling
  const loadMorePokemons = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const start = (nextPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      
      // Get the next batch of filtered Pokemon
      const nextBatch = filteredPokemons.slice(start, end);
      if (nextBatch.length === 0) {
        setHasMore(false);
        return;
      }
      
      const pokemonIds = nextBatch.map(p => p.id);
      
      // Load full details only for this batch
      const detailedPokemons = await clientApi.pokemon.getByIds(pokemonIds);
      
      // Add to displayed Pokemon
      setDisplayedPokemons(prev => [...prev, ...detailedPokemons]);
      setPage(nextPage);
      setHasMore(end < filteredPokemons.length);
    } catch (error) {
      console.error('Error loading more Pokemon:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, filteredPokemons, page]);

  // Reference for intersection detection (infinite scroll)
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPokemonElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePokemons();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMorePokemons]);
  
  // Debounced search for preventing too many requests
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // First load of metadata for all Pokemon
  useEffect(() => {
    async function loadAllPokemonMetadata() {
      setInitialLoading(true);
      try {
        // 1. Load metadata for all Pokemon
        const metadata = await clientApi.pokemon.getAllMetadata();
        
        // 2. Get IDs of all Pokemon
        const allIds = metadata.map(p => p.id);
        
        // 3. Get batch ratings for all Pokemon
        const batchRatings = await clientApi.pokemon.getBatchRatings(allIds);
        
        // 4. Merge metadata with ratings
        const enhancedMetadata = metadata.map(pokemon => ({
          ...pokemon,
          rating: batchRatings[pokemon.id]?.rating || 0,
          numberOfVotes: batchRatings[pokemon.id]?.numberOfVotes || 0
        }));
        
        console.log('Rating data loaded for', Object.keys(batchRatings).length, 'Pokemon');
        
        // 5. Update states with enriched data
        setAllPokemons(enhancedMetadata);
        setFilteredPokemons(enhancedMetadata);
        
        // 6. Load full data for initial display
        await loadInitialPokemons(enhancedMetadata);
      } catch (error) {
        console.error('Error loading Pokemon metadata:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    
    loadAllPokemonMetadata();
  }, []);
  
  // Initial load of first Pokemon
  async function loadInitialPokemons(pokemonList: Pokemon[]) {
    setLoading(true);
    try {
      // Take first Pokemon according to current filter
      const initialSet = pokemonList.slice(0, PAGE_SIZE);
      
      // Load full data only for this subset
      const detailedPokemons = await clientApi.pokemon.getByIds(
        initialSet.map(p => p.id)
      );
      
      setDisplayedPokemons(detailedPokemons);
      setPage(1);
      setHasMore(detailedPokemons.length < pokemonList.length);
    } catch (error) {
      console.error('Error loading initial Pokemon:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // Apply sorting to Pokemon
  const sortPokemons = (pokemons: Pokemon[]): Pokemon[] => {
    return [...pokemons].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          // Use safe value with strict type checking
          const ratingA = typeof a.rating === 'number' ? a.rating : 0;
          const ratingB = typeof b.rating === 'number' ? b.rating : 0;
          comparison = ratingA - ratingB;
          break;
        case 'numberOfVotes':
          // Use safe value with strict type checking
          const votesA = typeof a.numberOfVotes === 'number' ? a.numberOfVotes : 0;
          const votesB = typeof b.numberOfVotes === 'number' ? b.numberOfVotes : 0;
          comparison = votesA - votesB;
          break;
        case 'userRating':
          comparison = getRating(a.id) - getRating(b.id);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };
  
  // Filter and sort Pokemon when search, favorites or sorting changes
  useEffect(() => {
    setSearchLoading(true);
    
    // Apply filters and sorting to the full list
    const applyFiltersAndSort = () => {
      if (allPokemons.length === 0) return [];
      
      let result = [...allPokemons];
      
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        result = result.filter(pokemon => {
          const idMatch = pokemon.id.toString().includes(searchLower);
          const nameMatch = pokemon.name.toLowerCase().includes(searchLower);
          return idMatch || nameMatch;
        });
      }
      
      // Favorites filter
      if (showFavoritesOnly) {
        result = result.filter(pokemon => isFavorite(pokemon.id));
      }
      
      // Apply sorting
      return sortPokemons(result);
    };
    
    const filtered = applyFiltersAndSort();
    setFilteredPokemons(filtered);
    
    // Reset pagination and load first results
    loadInitialPokemons(filtered);
    setSearchLoading(false);
  }, [debouncedSearch, allPokemons, showFavoritesOnly, sortField, sortOrder, favorites, isFavorite]);
  
  // Function to handle sort change
  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      // Invert order if clicking on the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field: set the field and reset order to ascending
      setSortField(field);

      // For rating fields, default order is descending
      if (field === 'rating' || field === 'numberOfVotes' || field === 'userRating') {
        setSortOrder('desc');
      } else {
        // For other fields (id, name), keep ascending default order
        setSortOrder('asc');
      }
    }
  };
  
  // Get sort icon for a given field
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />;
    }
    
    return sortOrder === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4 text-blue-400" /> : 
      <ArrowDownIcon className="h-4 w-4 text-blue-400" />;
  };
  
  // Reset search and filters
  const resetFilters = () => {
    setSearchTerm('');
    setShowFavoritesOnly(false);
    setSortField('id');
    setSortOrder('asc');
  };
  
  const isFiltering = searchTerm !== '' || showFavoritesOnly || sortField !== 'id' || sortOrder !== 'asc';

  return (
    <div className="animate-fade-in">
      {/* Search bar and favorites button */}
      <div className="mb-6 flex gap-3 items-center">
        <div className="flex-grow">
          <SearchBar 
            value={searchTerm} 
            onChange={value => setSearchTerm(value)}
            loading={searchLoading}
          />
        </div>
        
        {/* Button to show only favorites */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`p-3 rounded-lg flex items-center justify-center ${
            showFavoritesOnly 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          } transition-all`}
          title="Show only favorites"
        >
          <HeartIcon className={`h-5 w-5 ${showFavoritesOnly ? 'text-white' : 'text-gray-400'}`} />
        </button>
      </div>
      
      {/* Sort options */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleSortChange('id')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
            sortField === 'id' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
          }`}
        >
          ID {getSortIcon('id')}
        </button>
        
        <button
          onClick={() => handleSortChange('name')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
            sortField === 'name' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
          }`}
        >
          Name {getSortIcon('name')}
        </button>
        
        <button
          onClick={() => handleSortChange('rating')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
            sortField === 'rating' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
          }`}
        >
          Community rating {getSortIcon('rating')}
        </button>
        
        <button
          onClick={() => handleSortChange('numberOfVotes')}
          className={`px-3 py-1.5 rounded-md flex itemsCenter gap-1.5 text-sm ${
            sortField === 'numberOfVotes' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
          }`}
        >
          Number of votes {getSortIcon('numberOfVotes')}
        </button>
        
        <button
          onClick={() => handleSortChange('userRating')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
            sortField === 'userRating' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
          }`}
        >
          My rating {getSortIcon('userRating')}
        </button>
      </div>
      
      <div className="border-t border-gray-800 pt-6">
        {initialLoading ? (
          <LoadingIndicator message="Loading Pokemon..." />
        ) : filteredPokemons.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <>
            {/* Results display with view selector */}
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {filteredPokemons.length} result{filteredPokemons.length > 1 ? 's' : ''}
                {isFiltering && (
                  <button 
                    onClick={resetFilters}
                    className="ml-2 text-blue-400 hover:text-blue-300 transition"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              {/* View mode selector */}
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
            
            {/* Pokemon grid/list */}
            <PokemonGrid 
              pokemons={displayedPokemons}
              loading={loading}
              lastPokemonRef={lastPokemonElementRef}
              viewMode={viewMode}
            />
            
            {/* Loading indicator for infinite scroll */}
            {loading && <LoadingIndicator message="Loading..." />}
          </>
        )}
      </div>
    </div>
  );
}