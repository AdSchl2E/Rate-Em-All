'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Pokemon } from '@/types/pokemon';
import { getPokemonTypeColors } from '@/lib/utils/pokemonTypes';

interface PokemonImageSectionProps {
  pokemon: Pokemon;
}

export default function PokemonImageSection({ pokemon }: PokemonImageSectionProps) {
  // Obtenir les couleurs basées sur le type du Pokémon
  const [primaryColor, secondaryColor] = getPokemonTypeColors(pokemon);
  
  // Animation pour l'image
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2
      }
    }
  };
  
  // URL de l'image
  const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default || 
                    pokemon.sprites.front_default || 
                    '/images/pokeball.png';

  return (
    <div 
      className="md:w-1/2 p-8 flex items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}40)` }}
    >
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br"
           style={{ background: `radial-gradient(circle at center, ${primaryColor}, ${secondaryColor} 80%)` }}></div>
      
      <motion.div
        className="relative w-64 h-64 flex items-center justify-center z-10"
        variants={imageVariants}
        initial="hidden"
        animate="visible"
      >
        <Image
          src={imageUrl}
          alt={pokemon.name}
          fill
          sizes="(max-width: 768px) 300px, 600px"
          className="object-contain drop-shadow-2xl"
          priority
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/pokeball.png";
          }}
        />
        
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center opacity-50">
          <Image
            src="/images/pokeball-silhouette.png"
            alt="Pokéball"
            width={120}
            height={120}
            className="opacity-20"
          />
        </div>
      </motion.div>
    </div>
  );
}