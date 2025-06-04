'use client';

import { useState, useMemo } from 'react';
import { ClientPokemonCard } from '../pokemon/ClientPokemonCard';
import { PokemonDetails } from '../../../types/pokemon';

interface TopRatedClientProps {
  initialPokemons: PokemonDetails[];
}

export function TopRatedClient({ initialPokemons }: TopRatedClientProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'votes' | 'name'>('rating');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Extraire tous les types uniques de Pokémon
  const pokemonTypes = useMemo(() => {
    const types = new Set<string>();
    types.add('all');
    
    initialPokemons.forEach(pokemon => {
      pokemon.types?.forEach(typeObj => {
        types.add(typeObj.type.name);
      });
    });
    
    return Array.from(types).sort();
  }, [initialPokemons]);
  
  // Filtrer et trier les Pokémon
  const displayedPokemons = useMemo(() => {
    // Filtrer par type si nécessaire
    let filtered = initialPokemons;
    if (typeFilter !== 'all') {
      filtered = initialPokemons.filter(pokemon => 
        pokemon.types?.some(typeObj => typeObj.type.name === typeFilter)
      );
    }
    
    // Trier selon le critère choisi
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'votes':
          return (b.numberOfVotes || 0) - (a.numberOfVotes || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [initialPokemons, typeFilter, sortBy]);
  
  return (
    <div className="mt-12">
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* Filtres par type */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Type:</span>
            <div className="flex flex-wrap gap-2 max-w-lg">
              {pokemonTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors
                    ${typeFilter === type 
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Options de tri */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'votes' | 'name')}
              className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm"
            >
              <option value="rating">Meilleure note</option>
              <option value="votes">Nombre de votes</option>
              <option value="name">Nom</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Affichage des résultats et du nombre */}
      <div className="text-sm text-gray-400 mb-4">
        {displayedPokemons.length} Pokémon {typeFilter !== 'all' ? `de type ${typeFilter}` : ''} 
      </div>
      
      {/* Grille de Pokémon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedPokemons.map((pokemon, index) => (
          <ClientPokemonCard 
            key={pokemon.id}
            pokemon={pokemon}
            showActions={true}
            showRating={true}
            rank={index + 1}
            highlighted={index < 3}
          />
        ))}
      </div>
    </div>
  );
}