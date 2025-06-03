'use client';

import { useState } from 'react';
import { ClientPokemonCard } from './ClientPokemonCard';
import { pokemonType } from '../../../types/pokemon';

interface PokemonGridProps {
  pokemons: pokemonType[];
  withRank?: boolean;
  showActions?: boolean;
}

export function PokemonGrid({ 
  pokemons, 
  withRank = false,
  showActions = true 
}: PokemonGridProps) {
  const [sortOption, setSortOption] = useState<'rating' | 'name' | 'id'>('rating');
  
  if (!pokemons || pokemons.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p>Aucun Pokémon à afficher</p>
      </div>
    );
  }

  const sortedPokemons = [...pokemons].sort((a, b) => {
    switch (sortOption) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'id':
        return a.id - b.id;
      default:
        return 0;
    }
  });

  return (
    <div>
      {/* Contrôles de tri */}
      <div className="mb-4 flex justify-end">
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm text-gray-400">
            Trier par:
          </label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as 'rating' | 'name' | 'id')}
            className="bg-gray-800 border border-gray-700 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Note</option>
            <option value="name">Nom</option>
            <option value="id">Numéro</option>
          </select>
        </div>
      </div>

      {/* Grille de Pokémon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedPokemons.map((pokemon, index) => (
          <ClientPokemonCard 
            key={pokemon.id}
            pokemon={pokemon}
            showActions={showActions}
            showRating={true}
            rank={withRank ? index + 1 : undefined}
          />
        ))}
      </div>
    </div>
  );
}