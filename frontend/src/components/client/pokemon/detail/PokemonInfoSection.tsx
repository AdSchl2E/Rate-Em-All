'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';

interface PokemonInfoSectionProps {
  pokemon: Pokemon;
}

/**
 * PokemonInfoSection component
 * Displays basic information about a Pokémon such as height, weight, etc.
 * 
 * @param {Object} props - Component props
 * @param {Pokemon} props.pokemon - Pokémon data to display
 */
export default function PokemonInfoSection({ pokemon }: PokemonInfoSectionProps) {
  /**
   * Format ability names for better readability
   * @param {string} name - Raw ability name
   * @returns {string} Formatted ability name
   */
  const formatAbilityName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="border-t border-gray-700 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <div className="text-gray-400 text-sm">Height</div>
        <div className="font-medium">{(pokemon.height / 10).toFixed(1)} m</div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <div className="text-gray-400 text-sm">Weight</div>
        <div className="font-medium">{(pokemon.weight / 10).toFixed(1)} kg</div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <div className="text-gray-400 text-sm">Base Experience</div>
        <div className="font-medium">{pokemon.base_experience || '?'}</div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <div className="text-gray-400 text-sm">Abilities</div>
        <div className="font-medium">
          {pokemon.abilities?.map(a => formatAbilityName(a.ability.name)).join(', ')}
        </div>
      </motion.div>
      
    </motion.div>
  );
}