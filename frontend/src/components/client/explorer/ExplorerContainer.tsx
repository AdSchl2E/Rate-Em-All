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

export type ViewMode = 'grid' | 'list';
export type SortField = 'id' | 'name' | 'rating' | 'numberOfVotes' | 'userRating';
export type SortOrder = 'asc' | 'desc';

const PAGE_SIZE = 20;

export default function ExplorerContainer({ initialTypes, totalCount }: { initialTypes: string[], totalCount: number }) {
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
  
  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  
  // Nouvel état pour le mode d'affichage
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Nouveaux états pour le tri et le filtre des favoris
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Récupérer le contexte global pour accéder aux favoris
  const { favorites, userRatings, isFavorite, getRating } = useGlobal();
  
  // Charger plus de Pokémon lors du défilement
  const loadMorePokemons = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const start = (nextPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      
      // Récupérer le prochain lot de Pokémon filtrés
      const nextBatch = filteredPokemons.slice(start, end);
      if (nextBatch.length === 0) {
        setHasMore(false);
        return;
      }
      
      const pokemonIds = nextBatch.map(p => p.id);
      
      // Charger les détails complets uniquement pour ce lot
      const detailedPokemons = await clientApi.pokemon.getByIds(pokemonIds);
      
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
        loadMorePokemons();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMorePokemons]);
  
  // Recherche debounced pour éviter trop de requêtes
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Premier chargement de métadonnées de tous les Pokémon
  useEffect(() => {
    async function loadAllPokemonMetadata() {
      setInitialLoading(true);
      try {
        // 1. Charger les métadonnées pour tous les Pokémon
        const metadata = await clientApi.pokemon.getAllMetadata();
        
        // 2. Récupérer les IDs de tous les Pokémon
        const allIds = metadata.map(p => p.id);
        
        // 3. Récupérer les notes en lot pour tous les Pokémon
        const batchRatings = await clientApi.pokemon.getBatchRatings(allIds);
        
        // 4. Fusionner les métadonnées avec les notes
        const enhancedMetadata = metadata.map(pokemon => ({
          ...pokemon,
          rating: batchRatings[pokemon.id]?.rating || 0,
          numberOfVotes: batchRatings[pokemon.id]?.numberOfVotes || 0
        }));
        
        console.log('Données de notation chargées pour', Object.keys(batchRatings).length, 'Pokémon');
        
        // 5. Mettre à jour les états avec les données enrichies
        setAllPokemons(enhancedMetadata);
        setFilteredPokemons(enhancedMetadata);
        
        // 6. Charger les premières données complètes pour l'affichage
        await loadInitialPokemons(enhancedMetadata);
      } catch (error) {
        console.error('Error loading Pokémon metadata:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    
    loadAllPokemonMetadata();
  }, []);
  
  // Chargement initial des premiers Pokémon
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
  
  // Appliquer le tri aux pokémons
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
          // Utiliser une valeur sûre avec type checking strict
          const ratingA = typeof a.rating === 'number' ? a.rating : 0;
          const ratingB = typeof b.rating === 'number' ? b.rating : 0;
          comparison = ratingA - ratingB;
          break;
        case 'numberOfVotes':
          // Utiliser une valeur sûre avec type checking strict
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
  
  // Filtrer et trier les Pokémon quand la recherche, les favoris ou le tri changent
  useEffect(() => {
    setSearchLoading(true);
    
    // Appliquer les filtres et le tri à la liste complète
    const applyFiltersAndSort = () => {
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
      
      // Filtre des favoris
      if (showFavoritesOnly) {
        result = result.filter(pokemon => isFavorite(pokemon.id));
      }
      
      // Appliquer le tri
      return sortPokemons(result);
    };
    
    const filtered = applyFiltersAndSort();
    setFilteredPokemons(filtered);
    
    // Réinitialiser la pagination et charger les premiers résultats
    loadInitialPokemons(filtered);
    setSearchLoading(false);
  }, [debouncedSearch, allPokemons, showFavoritesOnly, sortField, sortOrder, favorites, isFavorite]);
  
  // Fonction pour gérer le changement de tri
  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      // Inverser l'ordre si on clique sur le même champ
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau champ: définir le champ et réinitialiser l'ordre à ascendant
      setSortField(field);

      // Pour les champs de notation, l'ordre par défaut est descendant
      if (field === 'rating' || field === 'numberOfVotes' || field === 'userRating') {
        setSortOrder('desc');
      } else {
        // Pour les autres champs (id, name), on garde l'ordre ascendant par défaut
        setSortOrder('asc');
      }
    }
  };
  
  // Obtenir l'icône de tri pour un champ donné
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />;
    }
    
    return sortOrder === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4 text-blue-400" /> : 
      <ArrowDownIcon className="h-4 w-4 text-blue-400" />;
  };
  
  // Réinitialiser la recherche et les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setShowFavoritesOnly(false);
    setSortField('id');
    setSortOrder('asc');
  };
  
  const isFiltering = searchTerm !== '' || showFavoritesOnly || sortField !== 'id' || sortOrder !== 'asc';

  return (
    <div className="animate-fade-in">
      {/* Barre de recherche et bouton favoris */}
      <div className="mb-6 flex gap-3 items-center">
        <div className="flex-grow">
          <SearchBar 
            value={searchTerm} 
            onChange={value => setSearchTerm(value)}
            loading={searchLoading}
          />
        </div>
        
        {/* Bouton pour afficher uniquement les favoris */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`p-3 rounded-lg flex items-center justify-center ${
            showFavoritesOnly 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          } transition-all`}
          title="Afficher uniquement les favoris"
        >
          <HeartIcon className={`h-5 w-5 ${showFavoritesOnly ? 'text-white' : 'text-gray-400'}`} />
        </button>
      </div>
      
      {/* Options de tri */}
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
          Nom {getSortIcon('name')}
        </button>
        
        <button
          onClick={() => handleSortChange('rating')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
            sortField === 'rating' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
          }`}
        >
          Note communauté {getSortIcon('rating')}
        </button>
        
        <button
          onClick={() => handleSortChange('numberOfVotes')}
          className={`px-3 py-1.5 rounded-md flex itemsCenter gap-1.5 text-sm ${
            sortField === 'numberOfVotes' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
          }`}
        >
          Nombre de votes {getSortIcon('numberOfVotes')}
        </button>
        
        <button
          onClick={() => handleSortChange('userRating')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
            sortField === 'userRating' ? 'bg-gray-700 text-blue-400' : 'bg-gray-800 text-gray-300'
          }`}
        >
          Ma note {getSortIcon('userRating')}
        </button>
      </div>
      
      <div className="border-t border-gray-800 pt-6">
        {initialLoading ? (
          <LoadingIndicator message="Chargement des Pokémon..." />
        ) : filteredPokemons.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <>
            {/* Affichage des résultats avec sélecteur de vue */}
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-400">
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
              
              {/* Sélecteur de mode d'affichage */}
              <div className="bg-gray-800 rounded-lg p-1 inline-flex">
                <button
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  onClick={() => setViewMode('grid')}
                  title="Affichage en grille"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  onClick={() => setViewMode('list')}
                  title="Affichage en liste"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Grille/Liste de Pokémon */}
            <PokemonGrid 
              pokemons={displayedPokemons}
              loading={loading}
              lastPokemonRef={lastPokemonElementRef}
              viewMode={viewMode}
            />
            
            {/* Indicateur de chargement pour infinite scroll */}
            {loading && <LoadingIndicator message="Chargement..." />}
          </>
        )}
      </div>
    </div>
  );
}