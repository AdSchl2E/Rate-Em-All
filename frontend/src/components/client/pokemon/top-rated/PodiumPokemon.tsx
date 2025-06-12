'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';
import { Pokemon } from '@/types/pokemon';
import { typeColors } from '@/lib/utils/pokemonTypes';
import { CommunityRating } from '@/components/client/ui/CommunityRating';
import { ClientStarRating } from '@/components/client/ui/ClientStarRating';
import PokemonTypeTag from '../../shared/PokemonTypeTag';

// Configuration des positions du podium
const PODIUM_CONFIG = {
  1: {
    order: 'order-0 md:order-1',
    imageSize: { width: 140, height: 140 },
    titleClass: 'text-2xl font-bold bg-gradient-to-r from-yellow-200 to-amber-400 text-transparent bg-clip-text',
    podiumHeight: 'h-32',
    podiumStyle: 'from-yellow-600 to-amber-700',
    rankSize: 'text-3xl',
    marginBottom: 'mb-0 md:-mb-6',
    zIndex: 'z-10',
    glow: 'from-yellow-400 to-amber-600 opacity-40 group-hover:opacity-80',
    borderColor: 'border-yellow-500/50',
    heartClass: 'h-5 w-5 ml-2 text-red-500 animate-pulse',
    containerImgClass: 'h-36 -mt-20',
    badgeClass: 'px-3 py-1'
  },
  2: {
    order: 'order-1 md:order-0',
    imageSize: { width: 120, height: 120 },
    titleClass: 'text-xl font-semibold',
    podiumHeight: 'h-24',
    podiumStyle: 'from-gray-600 to-gray-700',
    rankSize: 'text-2xl',
    marginBottom: '',
    zIndex: '',
    glow: 'from-gray-200 to-gray-400 opacity-30 group-hover:opacity-100',
    borderColor: 'border-gray-700',
    heartClass: 'h-4 w-4 ml-2 text-red-500',
    containerImgClass: 'h-32 -mt-16',
    badgeClass: 'px-2 py-1'
  },
  3: {
    order: 'order-2 md:order-2',
    imageSize: { width: 100, height: 100 },
    titleClass: 'text-lg font-medium',
    podiumHeight: 'h-20',
    podiumStyle: 'from-amber-800 to-amber-900',
    rankSize: 'text-xl',
    marginBottom: '',
    zIndex: '',
    glow: 'from-amber-700 to-amber-900 opacity-30 group-hover:opacity-100',
    borderColor: 'border-amber-700/50',
    heartClass: 'h-3.5 w-3.5 ml-2 text-red-500',
    containerImgClass: 'h-28 -mt-14',
    badgeClass: 'px-2 py-0.5 text-xs'
  }
};

interface PodiumPokemonProps {
  pokemon: Pokemon;
  rank: 1 | 2 | 3;
  userRating?: number;
  isFavorite: boolean;
}

export default function PodiumPokemon({ pokemon, rank, userRating, isFavorite }: PodiumPokemonProps) {
  const config = PODIUM_CONFIG[rank];
  
  // Animation variants
  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.8
      }
    },
    hover: {
      scale: 1.1,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      className={`${config.order} w-full md:w-1/3 flex flex-col items-center ${config.marginBottom} ${config.zIndex}`}
      variants={itemVariants}
    >
      {/* Card Content */}
      <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl w-full p-4 pt-0 relative border ${config.borderColor}`}>
        <motion.div
          className={`${config.containerImgClass} flex items-center justify-center`}
          variants={imageVariants}
          whileHover="hover"
        >
          <Link href={`/pokemon/${pokemon?.id}`}>
            <div className="relative group">
              <div className={`absolute -inset-2 bg-gradient-to-r ${config.glow} rounded-full blur-md transition duration-1000 ${rank === 1 ? 'animate-pulse' : ''}`}></div>
              <Image
                src={pokemon?.sprites.other?.['official-artwork']?.front_default || pokemon?.sprites.front_default || '/images/pokeball.png'}
                width={config.imageSize.width}
                height={config.imageSize.height}
                alt={pokemon?.name || ''}
                className="drop-shadow-xl relative z-10"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/pokeball.png";
                }}
              />
            </div>
          </Link>
        </motion.div>

        <motion.h3
          className={`text-center ${config.titleClass} capitalize mb-1 flex items-center justify-center`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Link href={`/pokemon/${pokemon?.id}`} className="hover:text-blue-400 transition">
            {pokemon?.name}
          </Link>
          {isFavorite && (
            <HeartIcon className={config.heartClass} />
          )}
        </motion.h3>

        <motion.div
          className="flex justify-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {pokemon?.types?.map((typeObj, idx) => (
            <PokemonTypeTag 
              key={idx} 
              type={typeObj.type.name}
              className={`mx-1 ${config.badgeClass}`}
            />
          ))}
        </motion.div>

        <motion.div
          className="flex justify-center items-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4 }}
        >
          <CommunityRating
            rating={pokemon?.rating || 0}
            votes={pokemon?.numberOfVotes || 0}
            size={rank === 1 ? "lg" : "md"}
            showStars={false}
          />
        </motion.div>

        <motion.div
          className="flex justify-center items-center mt-2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          {userRating ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <ClientStarRating
                  value={userRating}
                  size={rank === 1 ? "md" : "sm"}
                  fixed={true}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">Vous n'avez pas encore noté ce Pokémon</div>
          )}
        </motion.div>
      </div>

      {/* Podium Base */}
      <div className={`bg-gradient-to-br ${config.podiumStyle} ${config.podiumHeight} w-full rounded-b-xl flex items-center justify-center overflow-hidden relative`}>
        <div className={`absolute inset-0 bg-cover mix-blend-overlay`}></div>
        {rank === 1 && <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent"></div>}
        <div className={`font-bold text-${rank === 1 ? 'white' : rank === 2 ? 'gray-300' : 'amber-200'} ${config.rankSize}`}>{rank}</div>
      </div>
    </motion.div>
  );
}