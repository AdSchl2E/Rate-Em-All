'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import RankingListItem from './RankingListItem';

interface RankingListProps {
  pokemons: Pokemon[];
  startRank: number;
  userRatings: Record<number, number>;
  favorites: number[];
}

export default function RankingList({ pokemons, startRank, userRatings, favorites }: RankingListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="space-y-3"
    >
      {pokemons.map((pokemon, idx) => (
        <RankingListItem
          key={pokemon.id}
          pokemon={pokemon}
          rank={idx + startRank}
          userRating={userRatings[pokemon.id]}
          isFavorite={favorites.includes(pokemon.id)}
        />
      ))}
    </motion.div>
  );
}