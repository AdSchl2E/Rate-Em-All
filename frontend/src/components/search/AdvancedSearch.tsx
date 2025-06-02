'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { pokemonTypes, typeColors } from '../../utils/pokemonTypes';

interface AdvancedSearchProps {
  onSearch?: (results: any[]) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [genRange, setGenRange] = useState<[number, number]>([1, 9]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 1) {
        performSearch();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query, selectedTypes, genRange]);
  
  const performSearch = async () => {
    setLoading(true);
    
    try {
      // Premièrement rechercher par nom
      const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
      let searchResults = [];
      
      if (query) {
        const response = await fetch(`${baseUrl}/${query.toLowerCase()}`);
        if (response.ok) {
          const pokemon = await response.json();
          searchResults = [pokemon];
        } else {
          // Recherche par nom partiel dans la liste
          const listResponse = await fetch(`${baseUrl}?limit=1000`);
          const data = await listResponse.json();
          searchResults = data.results
            .filter((p: any) => p.name.includes(query.toLowerCase()))
            .slice(0, 20); // Limiter les résultats
            
          // Récupérer les détails pour chaque résultat
          searchResults = await Promise.all(
            searchResults.map(async (p: any) => {
              const detailResponse = await fetch(p.url);
              return await detailResponse.json();
            })
          );
        }
      }
      
      // Filtrer par type si nécessaire
      if (selectedTypes.length > 0) {
        searchResults = searchResults.filter(pokemon => 
          pokemon.types.some((t: any) => selectedTypes.includes(t.type.name))
        );
      }
      
      // Filtrer par génération
      // Approximation basée sur les IDs des Pokémon:
      // Gen 1: 1-151, Gen 2: 152-251, etc.
      const genRanges = {
        1: [1, 151],
        2: [152, 251],
        3: [252, 386],
        4: [387, 493],
        5: [494, 649],
        6: [650, 721],
        7: [722, 809],
        8: [810, 898],
        9: [899, 1008]
      };
      
      const minId = genRanges[genRange[0] as keyof typeof genRanges][0];
      const maxId = genRanges[genRange[1] as keyof typeof genRanges][1];
      
      searchResults = searchResults.filter(pokemon => 
        pokemon.id >= minId && pokemon.id <= maxId
      );
      
      setResults(searchResults);
      if (onSearch) onSearch(searchResults);
      
    } catch (error) {
      console.error('Error searching Pokémon:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const clearSearch = () => {
    setQuery('');
    setSelectedTypes([]);
    setGenRange([1, 9]);
    setResults([]);
  };
  
  return (
    <div className="w-full mb-8">
      <div className="relative">
        <div className="flex items-center border-2 border-gray-700 rounded-lg p-2 bg-gray-800">
          <FaSearch className="text-gray-400 ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un Pokémon..."
            className="w-full px-3 py-2 bg-transparent text-white focus:outline-none"
          />
          {query && (
            <button onClick={clearSearch} className="text-gray-400 mx-2">
              <FaTimes />
            </button>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1 rounded-md flex items-center gap-2 transition-colors ${
              showFilters || selectedTypes.length > 0 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            <FaFilter /> Filtres {selectedTypes.length > 0 && `(${selectedTypes.length})`}
          </button>
        </div>
        
        {/* Affichage des résultats de recherche rapide */}
        {query && results.length > 0 && !showFilters && (
          <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-auto">
            {results.map(pokemon => (
              <div 
                key={pokemon.id}
                onClick={() => router.push(`/pokemon/${pokemon.id}`)}
                className="flex items-center p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
              >
                <img 
                  src={pokemon.sprites.front_default} 
                  alt={pokemon.name}
                  className="w-12 h-12 mr-4" 
                />
                <div>
                  <p className="font-semibold capitalize">{pokemon.name}</p>
                  <div className="flex gap-2 mt-1">
                    {pokemon.types.map((type: any) => (
                      <span 
                        key={type.type.name}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: typeColors[type.type.name] || '#777' }}
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-gray-400">#{pokemon.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Filtres avancés */}
      {showFilters && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg"
        >
          <h3 className="font-bold mb-3">Filtrer par type</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {pokemonTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-transform ${
                  selectedTypes.includes(type) ? 'scale-105 ring-2 ring-white' : ''
                }`}
                style={{ 
                  backgroundColor: typeColors[type] || '#777', 
                  color: ['fairy', 'ice', 'normal', 'flying', 'psychic'].includes(type) ? '#1F2937' : 'white'
                }}
              >
                {type}
              </button>
            ))}
          </div>
          
          <h3 className="font-bold mb-3">Génération</h3>
          <div className="px-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Gen {genRange[0]}</span>
              <span>Gen {genRange[1]}</span>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              value={genRange[0]}
              onChange={(e) => setGenRange([parseInt(e.target.value), genRange[1]])}
              className="w-full mb-4"
            />
            <input
              type="range"
              min="1"
              max="9"
              value={genRange[1]}
              onChange={(e) => setGenRange([genRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <button 
              onClick={clearSearch}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md"
            >
              Réinitialiser
            </button>
            <button
              onClick={performSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Rechercher
            </button>
          </div>
        </motion.div>
      )}
      
      {loading && (
        <div className="text-center my-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;