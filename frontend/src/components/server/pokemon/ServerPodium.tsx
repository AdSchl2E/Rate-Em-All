import Image from 'next/image';
import Link from 'next/link';
import { pokemonType } from '../../../types/pokemon';
import { ServerStarRating } from '../display/ServerStarRating';

interface ServerPodiumProps {
  pokemons: pokemonType[];
}

export function ServerPodium({ pokemons }: ServerPodiumProps) {
  // S'assurer qu'on a au plus 3 Pokémon
  const topThree = pokemons.slice(0, 3);
  
  // Si moins de 3 Pokémon, compléter avec des placeholders
  while (topThree.length < 3) {
    topThree.push({} as pokemonType);
  }
  
  // Réorganiser pour avoir le 1er au milieu, 2e à gauche, 3e à droite
  const [secondPlace, firstPlace, thirdPlace] = topThree;
  
  // Hauteurs relatives pour chaque position du podium
  const heights = {
    first: 'h-64',
    second: 'h-52',
    third: 'h-40'
  };
  
  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold text-center mb-8">Podium des meilleurs Pokémon</h2>
      
      <div className="flex flex-col items-center">
        <div className="flex items-end justify-center w-full max-w-3xl">
          {/* Deuxième place */}
          <PodiumPlace 
            pokemon={secondPlace} 
            place={2} 
            height={heights.second}
          />
          
          {/* Première place */}
          <PodiumPlace 
            pokemon={firstPlace} 
            place={1} 
            height={heights.first}
            isCenter={true}
          />
          
          {/* Troisième place */}
          <PodiumPlace 
            pokemon={thirdPlace} 
            place={3} 
            height={heights.third}
          />
        </div>
      </div>
    </section>
  );
}

interface PodiumPlaceProps {
  pokemon: pokemonType;
  place: number;
  height: string;
  isCenter?: boolean;
}

function PodiumPlace({ pokemon, place, height, isCenter = false }: PodiumPlaceProps) {
  const isEmpty = !pokemon.id;
  
  // Couleurs pour les différentes positions
  const colors = {
    1: 'from-yellow-500 to-amber-600 border-yellow-400',
    2: 'from-gray-300 to-gray-400 border-gray-200', 
    3: 'from-amber-600 to-amber-800 border-amber-500'
  };
  
  // Tailles pour les différentes positions
  const sizes = {
    center: 'w-1/3 md:w-1/3',
    sides: 'w-1/3 md:w-1/4',
  };
  
  return (
    <div className={`flex flex-col items-center ${isCenter ? sizes.center : sizes.sides}`}>
      {!isEmpty ? (
        <Link 
          href={`/pokemon/${pokemon.id}`}
          className="group w-full flex flex-col items-center"
        >
          {/* Pokémon image avec cercle et numéro */}
          <div className="relative mb-2">
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700">
              <span className={`font-bold text-lg ${place === 1 ? 'text-yellow-400' : place === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
                #{place}
              </span>
            </div>
            <div className="relative w-28 h-28 overflow-hidden rounded-full bg-gray-800 border-4 border-gray-700 group-hover:border-blue-500 transition-all">
              <Image 
                src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/placeholder.png'}
                alt={pokemon.name}
                fill
                className="object-contain p-1 group-hover:scale-110 transition-transform"
              />
            </div>
          </div>
          
          {/* Pokémon name */}
          <h3 className="font-bold text-center group-hover:text-blue-400 transition">
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <ServerStarRating value={pokemon.rating || 0} size="sm" />
            <span className="text-sm text-gray-400">
              ({(pokemon.rating || 0).toFixed(1)})
            </span>
          </div>
        </Link>
      ) : (
        <div className="w-full flex flex-col items-center opacity-30">
          <div className="relative mb-2">
            <div className="relative w-28 h-28 overflow-hidden rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center">
              <span className="text-3xl text-gray-600">?</span>
            </div>
          </div>
          <h3 className="font-bold text-center text-gray-600">
            À découvrir
          </h3>
        </div>
      )}
      
      {/* Podium base */}
      <div className={`${height} w-full rounded-t-lg mt-2 bg-gradient-to-b ${colors[place as keyof typeof colors]} border-t-2`}>
      </div>
    </div>
  );
}