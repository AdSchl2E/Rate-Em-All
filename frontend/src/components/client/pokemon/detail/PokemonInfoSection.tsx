'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';

interface PokemonInfoSectionProps {
  pokemon: Pokemon;
}

export default function PokemonInfoSection({ pokemon }: PokemonInfoSectionProps) {
  // Formater les noms des capacités
  const formatAbilityName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Variants d'animation pour Framer Motion
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
        <div className="text-gray-400 text-sm">Taille</div>
        <div className="font-medium">{(pokemon.height / 10).toFixed(1)} m</div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <div className="text-gray-400 text-sm">Poids</div>
        <div className="font-medium">{(pokemon.weight / 10).toFixed(1)} kg</div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <div className="text-gray-400 text-sm">Expérience de base</div>
        <div className="font-medium">{pokemon.base_experience || '?'}</div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <div className="text-gray-400 text-sm">Capacités</div>
        <div className="font-medium">
          {pokemon.abilities?.map(a => formatAbilityName(a.ability.name)).join(', ')}
        </div>
      </motion.div>
      
      {/* Autres informations comme la génération, habitat, etc. pourraient être ajoutées ici */}
    </motion.div>
  );
}