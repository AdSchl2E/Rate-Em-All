'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import { useGlobal } from '@/providers/GlobalProvider';
import PokemonHeader from './PokemonHeader';
import PokemonImageSection from './PokemonImageSection';
import PokemonRatingSection from './PokemonRatingSection';
import PokemonActions from './PokemonActions';
import PokemonStatsSection from './PokemonStatsSection';
import PokemonInfoSection from './PokemonInfoSection';

interface PokemonDetailContainerProps {
  pokemon: Pokemon;
}

export default function PokemonDetailContainer({ pokemon: initialPokemon }: PokemonDetailContainerProps) {
  const { pokemonCache } = useGlobal();
  
  // État local pour les données Pokémon, intégrant les données du cache si disponibles
  const [pokemon, setPokemon] = useState<Pokemon>({
    ...initialPokemon,
    rating: pokemonCache[initialPokemon.id]?.rating ?? initialPokemon.rating,
    numberOfVotes: pokemonCache[initialPokemon.id]?.numberOfVotes ?? initialPokemon.numberOfVotes
  });
  
  // Fonction pour mettre à jour les données du Pokémon (après une notation par exemple)
  const updatePokemonData = (data: Partial<Pokemon>) => {
    setPokemon(prev => ({
      ...prev,
      ...data
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-xl"
    >
      <div className="md:flex">
        {/* Section image du Pokémon */}
        <PokemonImageSection pokemon={pokemon} />
        
        {/* Section d'information */}
        <div className="md:w-1/2 p-6">
          {/* En-tête avec nom, ID, types */}
          <PokemonHeader pokemon={pokemon} />
          
          {/* Section notation */}
          <PokemonRatingSection
            pokemon={pokemon}
            onRatingUpdate={(rating, votes) => updatePokemonData({ rating, numberOfVotes: votes })}
          />
          
          {/* Actions utilisateur (favoris, partage) */}
          <PokemonActions pokemonId={pokemon.id} pokemonName={pokemon.name} />
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="border-t border-gray-700 p-6">
        <PokemonStatsSection stats={pokemon.stats || []} />
      </div>
      
      {/* Informations supplémentaires */}
      <PokemonInfoSection pokemon={pokemon} />
    </motion.div>
  );
}