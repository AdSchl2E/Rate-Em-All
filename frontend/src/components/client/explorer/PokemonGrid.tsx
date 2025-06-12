'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import Link from 'next/link';
import Image from 'next/image';
import { ClientStarRating } from '@/components/client/ui/ClientStarRating';
import { CommunityRating } from '@/components/client/ui/CommunityRating';
import { useGlobal } from '@/providers/GlobalProvider';
import { HeartIcon } from '@heroicons/react/24/solid';
import { typeColors } from '@/lib/utils/pokemonTypes';

interface PokemonGridProps {
  pokemons: Pokemon[];
  loading?: boolean;
  lastPokemonRef: (node: HTMLElement | null) => void;
}

export default function PokemonGrid({ pokemons, loading, lastPokemonRef }: PokemonGridProps) {
  const { isFavorite, getRating, pokemonCache } = useGlobal();
  
  // S'assurer que pokemons est toujours un tableau
  const pokemonArray: Pokemon[] = Array.isArray(pokemons) ? pokemons : [];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10
      }
    }
  };
  
  if (pokemonArray.length === 0 && !loading) {
    return <div className="text-center py-8 text-gray-400">Aucun Pokémon ne correspond à vos critères</div>;
  }

  console.log("Rendering PokemonGrid with", pokemonArray.length, "Pokémon");
  console.log("Pokemons data:", pokemonArray);
  
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {pokemonArray.map((pokemon: Pokemon, index: number) => {
      // Récupérer la note utilisateur
      const userRating: number = getRating(pokemon.id);
      
      // Utiliser les données du cache si disponibles
      const communityRating: number = pokemonCache[pokemon.id]?.rating ?? pokemon.rating ?? 0;
      const numberOfVotes: number = pokemonCache[pokemon.id]?.numberOfVotes ?? pokemon.numberOfVotes ?? 0;
      
      // Vérifier si c'est un favori
      const favorite: boolean = isFavorite(pokemon.id);
      
      // Référence pour le dernier élément (infinite scroll)
      const isLastItem: boolean = index === pokemonArray.length - 1;

      interface TypeObject {
        type: {
        name: string;
        };
      }

      interface Sprites {
        front_default?: string;
        other?: {
        [key: string]: {
          front_default?: string;
        };
        };
      }

      return (
        <motion.div 
        key={pokemon.id}
        variants={itemVariants}
        // Améliorer la façon dont la ref est attachée au dernier élément
        ref={isLastItem ? node => {
          // Debugging log
          console.log("Setting ref on last Pokémon:", pokemon.id);
          lastPokemonRef(node);
        } : null}
        >
        <Link 
          href={`/pokemon/${pokemon.id}`} 
          className="block bg-gray-800 hover:bg-gray-700 rounded-lg overflow-hidden transition h-full"
        >
          {/* Image avec fond coloré selon le type */}
          <div 
          className="relative h-32 flex items-center justify-center"
          style={{
            background: pokemon.types && pokemon.types[0]
            ? `radial-gradient(circle at center, ${typeColors[pokemon.types[0].type.name]}40, transparent 70%)`
            : 'transparent'
          }}
          >
          <Image
            src={
            (pokemon.sprites as Sprites).other?.['official-artwork']?.front_default ||
            (pokemon.sprites as Sprites).front_default ||
            '/images/pokeball.png'
            }
            alt={pokemon.name}
            width={96}
            height={96}
            className="object-contain z-10 drop-shadow-md"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/pokeball.png";
            }}
          />
          
          {/* Badge favori si applicable */}
          {favorite && (
            <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
            <HeartIcon className="h-4 w-4 text-white" />
            </div>
          )}
          
          {/* Badge numéro */}
          <div className="absolute top-2 left-2 bg-gray-900/70 rounded-md px-1.5 py-0.5">
            <span className="text-xs font-mono text-gray-300">#{pokemon.id}</span>
          </div>
          </div>
          
          {/* Informations */}
          <div className="p-3">
          <h3 className="text-center font-medium capitalize mb-2 truncate">
            {pokemon.name}
          </h3>
          
          {/* Types */}
          <div className="flex justify-center gap-1 mb-3">
            {pokemon.types?.map((typeObj: TypeObject, idx: number) => {
            const type: string = typeObj.type.name;
            return (
              <span
              key={idx}
              className="badge text-xs px-2 py-0.5 text-white font-medium"
              style={{ backgroundColor: typeColors[type] || '#AAAAAA' }}
              >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            );
            })}
          </div>
          
          <div className="flex items-center justify-between flex-col gap-2">
            {/* Note communautaire */}
            <CommunityRating
            rating={communityRating}
            votes={numberOfVotes}
            size="sm"
            showStars={false}
            prominent={true}
            />
            
            {/* Note utilisateur si applicable */}
            {userRating > 0 && (
            <div className="flex items-center">
              <ClientStarRating
              value={userRating}
              fixed={true}
              size="sm"
              useColors={true}
              />
            </div>
            )}
          </div>
          </div>
        </Link>
        </motion.div>
      );
      })}
    </motion.div>
  );
}