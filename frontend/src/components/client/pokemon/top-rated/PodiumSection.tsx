'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import PodiumPokemon from './PodiumPokemon';

interface PodiumSectionProps {
  podiumPokemons: Pokemon[];
  userRatings: Record<number, number>;
  favorites: number[];
}

export default function PodiumSection({ podiumPokemons, userRatings, favorites }: PodiumSectionProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Animation de confettis pour le vainqueur
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Variants d'animation pour Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3,
        when: "beforeChildren"
      }
    }
  };
  
  return (
    <motion.div
      className="mb-16 mt-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={() => setAnimationComplete(true)}
    >
      {/* Effets de confettis pour le gagnant */}
      <div className="relative mx-auto max-w-5xl">
        {animationComplete && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              <div className="animate-confetti-1 absolute w-2 h-2 bg-yellow-300 rounded-full"></div>
              <div className="animate-confetti-2 absolute w-3 h-3 bg-blue-400 rounded-full"></div>
              <div className="animate-confetti-3 absolute w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="animate-confetti-4 absolute w-4 h-1 bg-green-400"></div>
              <div className="animate-confetti-5 absolute w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="animate-confetti-6 absolute w-3 h-3 bg-pink-400 rounded-full"></div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-center items-end gap-4 mx-auto">
          {/* 2ème place - à gauche */}
          {podiumPokemons.length >= 2 && (
            <PodiumPokemon 
              pokemon={podiumPokemons[1]} 
              rank={2} 
              userRating={userRatings[podiumPokemons[1]?.id]} 
              isFavorite={favorites.includes(podiumPokemons[1]?.id)}
            />
          )}
          
          {/* 1ère place - au milieu */}
          {podiumPokemons.length >= 1 && (
            <PodiumPokemon 
              pokemon={podiumPokemons[0]} 
              rank={1} 
              userRating={userRatings[podiumPokemons[0]?.id]} 
              isFavorite={favorites.includes(podiumPokemons[0]?.id)}
            />
          )}
          
          {/* 3ème place - à droite */}
          {podiumPokemons.length >= 3 && (
            <PodiumPokemon 
              pokemon={podiumPokemons[2]} 
              rank={3} 
              userRating={userRatings[podiumPokemons[2]?.id]} 
              isFavorite={favorites.includes(podiumPokemons[2]?.id)}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}