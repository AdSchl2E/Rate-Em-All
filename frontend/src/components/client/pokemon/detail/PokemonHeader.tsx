'use client';

import { Pokemon } from '@/types/pokemon';
import TypeBadge from '../shared/TypeBadge';

interface PokemonHeaderProps {
  pokemon: Pokemon;
}

export default function PokemonHeader({ pokemon }: PokemonHeaderProps) {
  // Nom formaté (première lettre en majuscule)
  const formattedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-3xl font-bold">{formattedName}</h1>
        <span className="text-xl text-gray-400 font-mono">#{pokemon.id}</span>
      </div>
      
      <div className="flex gap-2">
        {pokemon.types?.map((typeObj, index) => (
          <TypeBadge key={index} type={typeObj.type.name} size="md" />
        ))}
      </div>
    </div>
  );
}