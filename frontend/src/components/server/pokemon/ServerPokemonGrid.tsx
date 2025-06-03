import Link from 'next/link';
import Image from 'next/image';
import { pokemonType } from '../../../types/pokemon';
import { typeColors } from '../../../lib/utils/pokemonTypes';
import { ServerStarRating } from '../display/ServerStarRating';

interface ServerPokemonGridProps {
  pokemons: pokemonType[];
}

export function ServerPokemonGrid({ pokemons }: ServerPokemonGridProps) {
  if (!pokemons || pokemons.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p>Aucun Pokémon à afficher</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {pokemons.map((pokemon) => (
        <Link 
          key={pokemon.id}
          href={`/pokemon/${pokemon.id}`}
          className="group rounded-xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 
            border border-gray-700 hover:border-gray-500 transition-all duration-200"
        >
          {/* Type badge */}
          {pokemon.types && pokemon.types.length > 0 && (
            <div className="absolute top-2 left-2 flex gap-1">
              {pokemon.types.slice(0, 2).map((typeObj, index) => {
                const type = typeObj.type.name;
                return (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: typeColors[type] || '#AAAAAA' }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                );
              })}
            </div>
          )}
          
          {/* Pokemon Image */}
          <div className="relative w-full h-48">
            <Image 
              src={pokemon.sprites.other?.['official-artwork']?.front_default || 
                   pokemon.sprites.front_default || 
                   '/placeholder.png'
              }
              alt={pokemon.name}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
              priority={true}
            />
          </div>
          
          {/* Pokemon Info */}
          <div className="p-4">
            <h3 className="text-xl font-bold text-center mb-2 group-hover:text-blue-300 transition">
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </h3>
            <div className="text-center text-sm text-gray-300 mb-3">
              #{pokemon.id}
            </div>
            
            {/* Rating */}
            <div className="flex justify-center items-center gap-2 mb-3">
              <ServerStarRating value={pokemon.rating || 0} />
              <span className="text-sm">
                ({(pokemon.rating || 0).toFixed(1)}/5, {pokemon.numberOfVotes || 0} vote{pokemon.numberOfVotes !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}