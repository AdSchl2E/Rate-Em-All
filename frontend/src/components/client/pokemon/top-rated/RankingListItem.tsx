import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon } from '@heroicons/react/24/solid';
import { Pokemon } from '@/types/pokemon';
import { CommunityRating } from '@/components/client/ui/CommunityRating';
import { ClientStarRating } from '@/components/client/ui/ClientStarRating';
import PokemonTypeTag from '../../shared/PokemonTypeTag';

interface RankingListItemProps {
  pokemon: Pokemon;
  rank: number;
  userRating?: number;
  isFavorite: boolean;
}

export default function RankingListItem({ pokemon, rank, userRating, isFavorite }: RankingListItemProps) {
  return (
    <div className="bg-gray-800/80 hover:bg-gray-700 transition rounded-lg shadow-lg overflow-hidden flex items-center">
      {/* Rank number */}
      <div className="p-4 flex-shrink-0 w-16 font-bold text-2xl text-center bg-gradient-to-br from-gray-800 to-gray-900">
        {rank}
      </div>

      {/* Pokémon info */}
      <Link href={`/pokemon/${pokemon.id}`} className="flex items-center flex-grow p-3 hover:text-blue-400 transition">
        <div className="w-12 h-12 mr-4 bg-gray-700/50 rounded-full overflow-hidden flex items-center justify-center">
          <Image
            src={pokemon.sprites.front_default || '/images/pokeball.png'}
            alt={pokemon.name}
            width={48}
            height={48}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/pokeball.png";
            }}
          />
        </div>

        <div>
          <div className="font-medium capitalize text-lg flex items-center">
            {pokemon.name}
            {isFavorite && (
              <HeartIcon className="h-4 w-4 ml-2 text-red-500" />
            )}
          </div>

          {/* Types */}
          <div className="flex flex-wrap gap-1 mt-1">
            {pokemon.types?.map((typeObj, typeIdx) => (
              <PokemonTypeTag 
                key={typeIdx}
                type={typeObj.type.name}
                className="px-2 py-0.5 text-xs"
              />
            ))}
          </div>
        </div>
      </Link>

      {/* Rating info - Community and User */}
      <div className="mr-6 flex flex-col md:flex-row gap-3 items-center">
        {/* User Rating */}
        <div className="flex items-center">
          {userRating ? (
            <div className="flex items-center gap-1">
              <ClientStarRating
                value={userRating}
                size="sm"
                fixed={true}
              />
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">Non noté</div>
          )}
        </div>
        {/* Community Rating */}
        <div>
          <CommunityRating
            rating={pokemon.rating || 0}
            votes={pokemon.numberOfVotes || 0}
            size="md"
            showVotes={true}
            prominent={true}
            showStars={false}
          />
        </div>
      </div>
    </div>
  );
}