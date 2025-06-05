'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ClientPokemonCard } from '../pokemon/ClientPokemonCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pokemon } from '../../../types/pokemon';
import { useGlobal } from '../../../providers/GlobalProvider';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon, ExclamationCircleIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { typeColors } from '../../../lib/utils/pokemonTypes';
import { debounce } from 'lodash';

// Pokémon generations with their Pokedex ranges
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

// List of all Pokémon types
const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Special categories of Pokémon
const SPECIAL_CATEGORIES = [
  { id: 'legendary', name: 'Légendaire' },
  { id: 'mythical', name: 'Mythique' },
  { id: 'starter', name: 'Starter' },
  { id: 'mega', name: 'Méga-Évolution' },
  { id: 'gmax', name: 'Gigamax' },
  { id: 'alolan', name: 'Forme d\'Alola' },
  { id: 'galarian', name: 'Forme de Galar' },
  { id: 'hisuian', name: 'Forme de Hisui' }
];

// Maximum number of Pokémon to load - increased to include all Pokémon including newest generations
const MAX_POKEMONS = 1400; // Higher value to ensure we get all main Pokémon species

// Ajouter ces catégories de formes alternatives
const FORM_CATEGORIES = [
  { id: 'mega', name: 'Méga-Évolution', pattern: /mega/ },
  { id: 'gmax', name: 'Gigamax', pattern: /gigantamax|gmax/ },
  { id: 'alola', name: 'Forme d\'Alola', pattern: /-alola/ },
  { id: 'galar', name: 'Forme de Galar', pattern: /-galar/ },
  { id: 'hisui', name: 'Forme de Hisui', pattern: /-hisui/ },
  { id: 'paldea', name: 'Forme de Paldea', pattern: /-paldea/ }
];

const RATING_OPTIONS = [
  { value: 1, label: '1★+' },
  { value: 2, label: '2★+' },
  { value: 3, label: '3★+' },
  { value: 4, label: '4★+' },
  { value: 4.5, label: '4.5★+' },
  { value: 4.8, label: '4.8★+' }
];

const VOTES_OPTIONS = [
  { value: 10, label: '10+ votes' },
  { value: 50, label: '50+ votes' },
  { value: 100, label: '100+ votes' },
  { value: 500, label: '500+ votes' },
  { value: 1000, label: '1000+ votes' }
];

type SortCriteria = 'id' | 'name' | 'rating';
type SortDirection = 'asc' | 'desc';
type SortOption = {
  criteria: SortCriteria;
  direction: SortDirection;
};

export function ClientPokemonExplorer() {
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined;
  const { loading: globalLoading } = useGlobal();

  // State for Pokémon data
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [minVotes, setMinVotes] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>({
    criteria: 'id',
    direction: 'asc'
  });

  // Set for tracking loaded Pokémon IDs
  const loadedIds = useRef(new Set<number>());

  // Reference to search input for focusing
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Ajouter une ref pour le conteneur de la barre de recherche
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Ajouter ces états pour suivre la progression du chargement
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalPokemonCount, setTotalPokemonCount] = useState(0);

  // Load all Pokémon data at once
  const fetchAllPokemons = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setLoadingProgress(0);

    try {
      // First fetch to get the total count of Pokémon from the API
      const countResponse = await fetch(`/api/pokemons/count`);
      let pokemonCount = MAX_POKEMONS;

      if (countResponse.ok) {
        const countData = await countResponse.json();
        pokemonCount = countData.count || MAX_POKEMONS;
        console.log(`API reports ${pokemonCount} total Pokémon`);
        setTotalPokemonCount(pokemonCount);
      } else {
        console.log(`Using default MAX_POKEMONS: ${MAX_POKEMONS}`);
        setTotalPokemonCount(MAX_POKEMONS);
      }

      setLoadingProgress(30);

      // Étape 1: Charger les Pokémon standards (jusqu'à Gen 9)
      const response = await fetch(`/api/pokemons/list?page=0&limit=1010`);

      if (!response.ok) throw new Error('Erreur lors du chargement des Pokémon');

      setLoadingProgress(90);

      const mainData = await response.json();
      const mainPokemons = mainData.pokemons || [];
      console.log(`Loaded ${mainPokemons.length} main Pokémon`);

      // Ajouter les IDs au tracking set
      mainPokemons.forEach((pokemon: Pokemon) => loadedIds.current.add(pokemon.id));
      setLoadingProgress(90);

      // Étape 2: Charger les formes alternatives (après ID 10000)
      const altResponse = await fetch(`/api/pokemons/alternate-forms?offset=1010&limit=${pokemonCount - 1010}`);
      let altPokemons: Pokemon[] = [];

      if (altResponse.ok) {
        const altData = await altResponse.json();
        altPokemons = altData.pokemons || [];
        console.log(`Loaded ${altPokemons.length} alternate forms`);

        // Ajouter les IDs au tracking set
        altPokemons.forEach((pokemon: Pokemon) => loadedIds.current.add(pokemon.id));
      } else {
        console.error("Failed to load alternate forms");
      }

      setLoadingProgress(95);

      // Combiner les deux ensembles de données
      const allPokemons = [...mainPokemons, ...altPokemons];

      // Store all Pokémon
      setPokemons(allPokemons);
      setFilteredPokemons(allPokemons);

      setLoadingProgress(100);
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Erreur:", error);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Search functionality
  const searchPokemons = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowSearchSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/pokemons/search?q=${encodeURIComponent(query.trim())}`);
        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        setSearchResults(data.pokemons || []);
        setShowSearchSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Apply all filters to the Pokémon list
  const applyFilters = useCallback((pokemonList: Pokemon[]): Pokemon[] => {
    return pokemonList.filter(pokemon => {
      const pokemonName = pokemon.name.toLowerCase();

      // Type filter - EXACT matching
      if (selectedTypes.length > 0) {
        const pokemonTypes = pokemon.types?.map(t => t.type.name) || [];
        if (selectedTypes.length !== pokemonTypes.length) return false;

        for (const type of selectedTypes) {
          if (!pokemonTypes.includes(type)) return false;
        }
      }

      // Generation filter
      if (selectedGenerations.length > 0) {
        // Si c'est une forme alternative avec ID > 10000, vérifier le nom pour déterminer sa génération
        if (pokemon.id > 10000) {
          // Extraire l'ID de base du nom (si possible)
          // Exemple: "charizard-mega" est une forme de Charizard (ID 6, Gen 1)
          let basePokemonId = 0;

          // Recherche d'un pattern dans le nom pour déterminer le Pokémon de base
          // Exemple: "charizard-mega" est une forme de Charizard (ID 6, Gen 1)
          const patterns = [
            { pattern: /charizard/, id: 6 },
            { pattern: /venusaur/, id: 3 },
            { pattern: /blastoise/, id: 9 },
            // Ajouter d'autres mappages connus ici
          ];

          for (const mapping of patterns) {
            if (mapping.pattern.test(pokemonName)) {
              basePokemonId = mapping.id;
              break;
            }
          }

          // Si on n'a pas réussi à déterminer l'ID de base, laisser passer ce Pokémon
          if (basePokemonId === 0) return true;

          // Vérifier si l'ID de base correspond à l'une des générations sélectionnées
          const genMatch = selectedGenerations.some(genIndex => {
            const gen = GENERATIONS[genIndex];
            return basePokemonId >= gen.range[0] && basePokemonId <= gen.range[1];
          });

          if (!genMatch) return false;
        } else {
          // Pour les Pokémon standards, utiliser l'ID directement
          const genMatch = selectedGenerations.some(genIndex => {
            const gen = GENERATIONS[genIndex];
            return pokemon.id >= gen.range[0] && pokemon.id <= gen.range[1];
          });

          if (!genMatch) return false;
        }
      }

      // Special categories filter
      if (selectedCategories.length > 0) {
        const legendaryIds = [144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898];
        const mythicalIds = [151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893];
        const starterIds = [1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816, 906, 909, 912];

        const isLegendary = legendaryIds.includes(pokemon.id);
        const isMythical = mythicalIds.includes(pokemon.id);
        const isStarter = starterIds.includes(pokemon.id);

        // Vérifier les formes alternatives
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

        // Vérifier si au moins une des catégories sélectionnées correspond
        const hasCategory = selectedCategories.some(cat =>
          categoryMatches[cat as keyof typeof categoryMatches]
        );

        if (!hasCategory) return false;
      }

      // Rating filter
      if (minRating !== null) {
        const pokemonRating = pokemon.rating || 0;
        if (pokemonRating < minRating) return false;
      }

      // Votes filter
      if (minVotes !== null) {
        const pokemonVotes = pokemon.numberOfVotes || 0;
        if (pokemonVotes < minVotes) return false;
      }

      // Search query filter (if active)
      if (searchQuery && !pokemonName.includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      // Déterminer le facteur de direction (1 pour croissant, -1 pour décroissant)
      const directionFactor = sortOption.direction === 'asc' ? 1 : -1;

      // Trier selon le critère choisi
      switch (sortOption.criteria) {
        case 'name':
          return directionFactor * a.name.localeCompare(b.name);
        case 'rating':
          // Inverser a et b pour que les meilleures notes soient en premier par défaut
          return directionFactor * ((b.rating || 0) - (a.rating || 0));
        case 'id':
        default:
          return directionFactor * (a.id - b.id);
      }
    });
  }, [selectedTypes, selectedGenerations, selectedCategories, minRating, minVotes, sortOption, searchQuery]);

  // Update filtered Pokémon when filters change
  useEffect(() => {
    setFilteredPokemons(applyFilters(pokemons));
  }, [pokemons, applyFilters]);

  // Search effect
  useEffect(() => {
    if (searchQuery) {
      searchPokemons(searchQuery);
    } else {
      setSearchResults([]);
      setShowSearchSuggestions(false);
    }
  }, [searchQuery, searchPokemons]);

  // Initial load effect - load all Pokémon at once
  useEffect(() => {
    if (!initialLoadDone) {
      fetchAllPokemons();
    }
  }, [initialLoadDone, fetchAllPokemons]);

  const handleSortChange = (criteria: SortCriteria) => {
    if (sortOption.criteria === criteria) {
      // Si on clique sur le même critère, inverser la direction
      setSortOption({
        criteria,
        direction: sortOption.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Si on change de critère, utiliser la direction par défaut pour chaque type
      setSortOption({
        criteria,
        direction: criteria === 'rating' ? 'desc' : 'asc' // Par défaut: note décroissante, autres croissants
      });
    }
  };

  // Handle search suggestion selection
  const handleSelectSearchResult = (pokemon: Pokemon) => {
    setSearchQuery(pokemon.name);
    setShowSearchSuggestions(false);

    // Add the Pokémon to our list if not already there
    if (!loadedIds.current.has(pokemon.id)) {
      loadedIds.current.add(pokemon.id);
      setPokemons(prev => [...prev, pokemon]);
    }
  };

  // Clear search and reset filters
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Toggle type selection with maximum of 2 types
  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        // Remove type if already selected
        return prev.filter(t => t !== type);
      } else {
        // Add type if less than 2 are selected, otherwise replace the first one
        return prev.length < 2 ? [...prev, type] : [prev[1], type];
      }
    });
  };

  const toggleGeneration = (genIndex: number) => {
    setSelectedGenerations(prev =>
      prev.includes(genIndex)
        ? prev.filter(g => g !== genIndex)
        : [...prev, genIndex]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedGenerations([]);
    setSelectedCategories([]);
    setMinRating(null);
    setMinVotes(null);
    setSortOption({ criteria: 'id', direction: 'asc' });
  };

  // Ajouter un effet pour gérer les clics en dehors de la barre de recherche
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        showSearchSuggestions
      ) {
        setShowSearchSuggestions(false);
      }
    }

    // Ajouter l'écouteur d'événement au document
    document.addEventListener('mousedown', handleClickOutside);

    // Nettoyer l'écouteur d'événement
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchSuggestions]);

  const isDataLoading = loading || globalLoading;
  const isFiltering = selectedTypes.length > 0 ||
    selectedGenerations.length > 0 ||
    selectedCategories.length > 0 ||
    minRating !== null ||
    minVotes !== null;
  const displayedPokemons = filteredPokemons;

  return (
    <div className="animate-fade-in">
      {/* Search and filters header */}
      <div className="mb-6 space-y-4">
        {/* Flex container for search bar and filter button */}
        <div className="flex items-center gap-2">
          {/* Search bar - with flex-grow to take available space */}
          <div className="flex-grow relative" ref={searchContainerRef}>
            <div className="flex w-full items-center bg-gray-800 rounded-lg overflow-hidden shadow-lg focus-within:ring-2 focus-within:ring-blue-500">
              <MagnifyingGlassIcon className="h-5 w-5 ml-3 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="flex-grow bg-transparent border-0 py-3 pl-2 pr-10 text-white focus:outline-none focus:ring-0"
                placeholder="Rechercher un Pokémon par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchSuggestions(true)}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search suggestions dropdown */}
            {showSearchSuggestions && searchResults.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-gray-800 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {searchResults.map(pokemon => (
                  <div
                    key={pokemon.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSelectSearchResult(pokemon)}
                  >
                    <div className="w-10 h-10 flex-shrink-0">
                      <img
                        src={pokemon.sprites?.front_default || pokemon.sprites?.other?.["official-artwork"]?.front_default || "/images/pokeball.png"}
                        alt={pokemon.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/pokeball.png";
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium capitalize">{pokemon.name}</div>
                      <div className="text-xs text-gray-400">#{pokemon.id.toString().padStart(3, '0')}</div>
                    </div>
                    <div className="flex flex-wrap gap-1 mr-2">
                      {pokemon.types?.map(typeObj => (
                        <span
                          key={typeObj.type.name}
                          className="px-2 py-0.5 text-xs rounded-full capitalize"
                          style={{
                            backgroundColor: `${typeColors[typeObj.type.name]}40`,
                            color: typeColors[typeObj.type.name]
                          }}
                        >
                          {typeObj.type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="absolute top-full mt-2 w-full flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          {/* Filters toggle button - now next to search bar */}
          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition
              ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Filtres {isFiltering && `(${selectedTypes.length + selectedGenerations.length + selectedCategories.length + (minRating !== null ? 1 : 0) + (minVotes !== null ? 1 : 0)})`}
          </button>
        </div>

        {/* Filters panel - remains below both elements */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg space-y-6 mt-2">
            
                        {/* Sort options */}
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Trier par</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'id', label: 'Numéro' },
                  { id: 'name', label: 'Nom' },
                  { id: 'rating', label: 'Note' }
                ].map((option) => (
                  <button
                    key={option.id}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                      ${sortOption.criteria === option.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => handleSortChange(option.id as SortCriteria)}
                  >
                    <span>{option.label}</span>
                    {sortOption.criteria === option.id && (
                      sortOption.direction === 'asc'
                        ? <ArrowUpIcon className="h-3 w-3" />
                        : <ArrowDownIcon className="h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rating filters - NEW */}
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Note minimale</h3>
              <div className="flex flex-wrap gap-2">
                {RATING_OPTIONS.map((option) => (
                  <button
                    key={`rating-${option.value}`}
                    className={`px-3 py-1 rounded-full text-sm
                      ${minRating === option.value
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => setMinRating(prev => prev === option.value ? null : option.value)}
                  >
                    {option.label}
                  </button>
                ))}
                {minRating !== null && (
                  <button
                    className="px-3 py-1 rounded-full text-xs bg-red-600 text-white"
                    onClick={() => setMinRating(null)}
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Votes filters - NEW */}
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Nombre de votes minimum</h3>
              <div className="flex flex-wrap gap-2">
                {VOTES_OPTIONS.map((option) => (
                  <button
                    key={`votes-${option.value}`}
                    className={`px-3 py-1 rounded-full text-sm
                      ${minVotes === option.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => setMinVotes(prev => prev === option.value ? null : option.value)}
                  >
                    {option.label}
                  </button>
                ))}
                {minVotes !== null && (
                  <button
                    className="px-3 py-1 rounded-full text-xs bg-red-600 text-white"
                    onClick={() => setMinVotes(null)}
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Type filters - with max 2 selection limit */}
            <div>
              <div className="flex justify-left items-center mb-2 gap-2">
                <h3 className="font-medium text-gray-300">Types</h3>
                <div className="text-xs text-gray-400">
                  {selectedTypes.length}/2 sélectionnés
                  {selectedTypes.length === 2 && (
                    <span className="ml-1 text-amber-400">
                      (max atteint)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {POKEMON_TYPES.map(type => (
                  <button
                    key={type}
                    className={`px-3 py-1 rounded-full text-sm capitalize transition-colors
                      ${selectedTypes.includes(type)
                        ? `bg-opacity-90 text-white`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    style={{
                      backgroundColor: selectedTypes.includes(type)
                        ? typeColors[type]
                        : undefined
                    }}
                    onClick={() => toggleType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation filters */}
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Génération</h3>
              <div className="flex flex-wrap gap-2">
                {GENERATIONS.map((gen, index) => (
                  <button
                    key={gen.name}
                    className={`px-3 py-1 rounded-full text-sm
                      ${selectedGenerations.includes(index)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => toggleGeneration(index)}
                  >
                    {gen.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Special categories */}
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Catégories</h3>
              <div className="flex flex-wrap gap-2">
                {SPECIAL_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`px-3 py-1 rounded-full text-sm
                      ${selectedCategories.includes(category.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>



            {/* Reset filters button */}
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User login message */}
      {!userId && (
        <p className="text-center my-4 bg-gray-800 p-4 rounded-lg">
          Connectez-vous pour noter les Pokémon et les ajouter aux favoris
        </p>
      )}

      {/* Results count and stats */}
      <div className="mb-4 text-sm text-gray-400">
        {displayedPokemons.length} Pokémon affichés
        {isFiltering && ` (sur ${pokemons.length} total)`}
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedPokemons.length > 0 ? (
          displayedPokemons.map((pokemon) => (
            <div key={`pokemon-${pokemon.id}`}>
              <ClientPokemonCard
                pokemon={pokemon}
                showActions={true}
                showRating={true}
              />
            </div>
          ))
        ) : !isDataLoading && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">Aucun Pokémon trouvé</p>
            {isFiltering && (
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isDataLoading && (
        <div className="text-center my-6">
          <div className="mb-4">
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {loadingProgress < 100
                ? `Chargement: ${loadingProgress}%`
                : 'Finalisation...'}
            </p>
          </div>
          <LoadingSpinner />
          <p className="mt-2 text-gray-400">
            Chargement de {totalPokemonCount} Pokémon...
          </p>
        </div>
      )}

    </div>
  );
}