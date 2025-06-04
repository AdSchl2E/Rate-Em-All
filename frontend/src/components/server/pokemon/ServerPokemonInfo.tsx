import Image from 'next/image';
import { typeColors } from '../../../lib/utils/pokemonTypes';
import { ServerStatBar } from '../display/ServerStatBar';
import { Pokemon } from '../../../types/pokemon';

export function ServerPokemonInfo({ pokemon }: { pokemon: Pokemon }) {
  const mainType = pokemon.types[0].type.name;
  const typeColor = typeColors[mainType] || '#AAAAAA';

  return (
    <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
      <div 
        className="relative py-12 px-6"
        style={{
          background: `linear-gradient(180deg, ${typeColor}40 0%, rgba(17, 24, 39, 1) 100%)`
        }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Image Pokémon */}
          <div className="relative w-64 h-64">
            <Image
              src={pokemon.sprites.other['official-artwork'].front_default || '/placeholder.png'}
              alt={pokemon.name}
              fill
              priority
              className="object-contain drop-shadow-2xl"
              sizes="(max-width: 768px) 100vw, 256px"
            />
          </div>
          
          {/* Information Pokémon */}
          <div className="flex-grow">
            <h1 className="text-3xl font-bold capitalize mb-4">
              {pokemon.name} <span className="text-gray-400">#{pokemon.id}</span>
            </h1>
            
            {/* Types */}
            <div className="flex gap-2 mb-6">
              {pokemon.types.map((typeObj) => (
                <span 
                  key={typeObj.type.name}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: typeColors[typeObj.type.name] || '#AAAAAA' }}
                >
                  {typeObj.type.name}
                </span>
              ))}
            </div>
            
            {/* Stats de base */}
            <div className="space-y-2">
              {pokemon.stats.map(stat => (
                <ServerStatBar 
                  key={stat.stat.name}
                  statName={stat.stat.name}
                  value={stat.base_stat}
                />
              ))}
            </div>
          </div>
          
          {/* Informations générales */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-center text-xl font-bold mb-2">Caractéristiques</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <span className="text-sm text-gray-400">Poids</span>
                <div className="font-bold">{pokemon.weight / 10} kg</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg text-center">
                <span className="text-sm text-gray-400">Taille</span>
                <div className="font-bold">{pokemon.height / 10} m</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg text-center col-span-2">
                <span className="text-sm text-gray-400">Note moyenne</span>
                <div className="font-bold flex items-center justify-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  {pokemon.rating?.toFixed(1) || '0.0'}/5
                  <span className="text-sm text-gray-400 ml-2">
                    ({pokemon.numberOfVotes || 0} votes)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}