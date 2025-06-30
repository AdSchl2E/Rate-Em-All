import Image from 'next/image';
import Link from 'next/link';
import { Pokemon } from '../../../types/pokemon';
import { ServerStarRating } from '../display/ServerStarRating';

/**
 * ServerPodium props interface
 */
interface ServerPodiumProps {
  /** List of top-rated Pokemon to display on the podium */
  pokemons: Pokemon[];
}

/**
 * ServerPodium component
 * 
 * Displays a visual podium with the top three Pokemon.
 * The first place is centered, second on the left, and third on the right.
 * 
 * @param props - Component props
 * @returns React server component
 */
export function ServerPodium({ pokemons }: ServerPodiumProps) {
  // Ensure we have at most 3 Pokemon
  const topThree = pokemons.slice(0, 3);
  
  // If less than 3 Pokemon, fill with placeholders
  while (topThree.length < 3) {
    topThree.push({} as Pokemon);
  }
  
  // Rearrange to have 1st in the middle, 2nd on the left, 3rd on the right
  const [secondPlace, firstPlace, thirdPlace] = topThree;
  
  // Relative heights for each podium position
  const heights = {
    first: 'h-64',
    second: 'h-52',
    third: 'h-40'
  };
  
  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold text-center mb-8">Top Pokémon Podium</h2>
      
      <div className="flex flex-col items-center">
        <div className="flex items-end justify-center w-full max-w-3xl">
          {/* Second place */}
          <PodiumPlace 
            pokemon={secondPlace} 
            place={2} 
            height={heights.second}
          />
          
          {/* First place */}
          <PodiumPlace 
            pokemon={firstPlace} 
            place={1} 
            height={heights.first}
            isCenter={true}
          />
          
          {/* Third place */}
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

/**
 * PodiumPlace props interface
 */
interface PodiumPlaceProps {
  /** Pokemon to display on this podium position */
  pokemon: Pokemon;
  /** Placement position (1, 2, or 3) */
  place: number;
  /** CSS height class for the podium */
  height: string;
  /** Whether this is the center position */
  isCenter?: boolean;
}

/**
 * PodiumPlace component
 * 
 * Displays a single position on the podium with the Pokemon and its ranking.
 * 
 * @param props - Component props
 * @returns React component
 */
function PodiumPlace({ pokemon, place, height, isCenter = false }: PodiumPlaceProps) {
  const isEmpty = !pokemon.id;
  
  // Colors for different positions
  const colors = {
    1: 'from-yellow-500 to-amber-600 border-yellow-400',
    2: 'from-gray-300 to-gray-400 border-gray-200', 
    3: 'from-amber-600 to-amber-800 border-amber-500'
  };
  
  // Sizes for different positions
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
          {/* Pokemon image with circle and number */}
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
          
          {/* Pokemon name */}
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
            Yet to discover
          </h3>
        </div>
      )}
      
      {/* Podium base */}
      <div className={`${height} w-full rounded-t-lg mt-2 bg-gradient-to-b ${colors[place as keyof typeof colors]} border-t-2`}>
      </div>
    </div>
  );
}