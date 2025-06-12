import Link from 'next/link';
import Image from 'next/image';
import { Pokemon } from '@/types/pokemon';
import { FireIcon } from '@heroicons/react/24/solid';
import { typeColors } from '@/lib/utils/pokemonTypes';
import { CommunityRating } from '@/components/client/ui/CommunityRating';

interface TopRatedSectionProps {
  pokemons: Pokemon[];
}

export default function TopRatedSection({ pokemons }: TopRatedSectionProps) {
  if (!pokemons.length) return null;
  
  return (
    <section>
      <div className="flex items-center mb-6">
        <FireIcon className="h-6 w-6 text-amber-500 mr-2" />
        <h2 className="text-2xl font-bold">Top Rated Pokémon</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {pokemons.map((pokemon, index) => {
          const mainType = pokemon.types?.[0]?.type.name || 'normal';
          const bgColor = typeColors[mainType] || '#AAAAAA';
          
          return (
            <Link 
              key={pokemon.id} 
              href={`/pokemon/${pokemon.id}`}
              className="flex items-center bg-gray-800 hover:bg-gray-700 rounded-lg overflow-hidden transition-colors p-4 group"
            >
              {/* Rank badge */}
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-amber-600 flex items-center justify-center mr-3 font-bold">
                {index + 1}
              </div>
              
              {/* Pokémon image */}
              <div 
                className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center mr-4"
                style={{ backgroundColor: `${bgColor}30` }}
              >
                <Image 
                  src={pokemon.sprites.front_default || '/images/pokeball.png'}
                  alt={pokemon.name}
                  width={60}
                  height={60}
                  className="object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              
              {/* Pokémon info */}
              <div className="flex-grow">
                <h3 className="font-medium capitalize mb-1">{pokemon.name}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {pokemon.types?.map((typeObj, idx) => (
                    <span
                      key={idx}
                      className="badge px-2 py-0.5 text-xs text-white font-medium"
                      style={{ backgroundColor: typeColors[typeObj.type.name] }}
                    >
                      {typeObj.type.name}
                    </span>
                  ))}
                </div>
                
                <CommunityRating
                  rating={pokemon.rating || 0}
                  votes={pokemon.numberOfVotes || 0}
                  size="sm"
                  showStars={true}
                />
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="text-center mt-6">
        <Link 
          href="/top-rated"
          className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          <span>View all rankings</span>
          <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}