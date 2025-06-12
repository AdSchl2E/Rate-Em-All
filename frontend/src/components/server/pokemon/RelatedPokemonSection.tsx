import Link from 'next/link';
import Image from 'next/image';
import { Pokemon } from '@/types/pokemon';
import { typeColors } from '@/lib/utils/pokemonTypes';
import TypeBadge from '@/components/client/pokemon/shared/TypeBadge';

interface RelatedPokemonSectionProps {
  pokemonList: Pokemon[];
  title: string;
}

export default function RelatedPokemonSection({ 
  pokemonList, 
  title 
}: RelatedPokemonSectionProps) {
  if (pokemonList.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex flex-wrap gap-4">
        {pokemonList.map(pokemon => (
          <Link
            href={`/pokemon/${pokemon.id}`}
            key={pokemon.id}
            className="bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg overflow-hidden w-32 flex flex-col"
          >
            <div 
              className="h-24 flex items-center justify-center"
              style={{
                background: pokemon.types?.[0] 
                  ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), ${typeColors[pokemon.types[0].type.name]}`
                  : 'gray'
              }}
            >
              <Image
                src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/images/pokeball.png'}
                width={60}
                height={60}
                alt={pokemon.name}
                className="drop-shadow-md"
              />
            </div>
            <div className="p-2 text-center">
              <div className="text-sm font-medium capitalize truncate">{pokemon.name}</div>
              <div className="flex justify-center gap-1 mt-1">
                {pokemon.types?.slice(0, 2).map((typeObj, idx) => (
                  <TypeBadge 
                    key={idx}
                    type={typeObj.type.name}
                    size="xs"
                  />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}