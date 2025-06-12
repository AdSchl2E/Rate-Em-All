'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import { useGlobal } from '@/providers/GlobalProvider';
import PokemonCard from '@/components/client/shared/PokemonCard';

interface PokemonCarouselProps {
  pokemons: Pokemon[];
}

export default function PokemonCarousel({ pokemons }: PokemonCarouselProps) {
  const { pokemonCache } = useGlobal();
  const [shuffledPokemons, setShuffledPokemons] = useState<Pokemon[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Mélanger et filtrer les Pokémon au chargement
  useEffect(() => {
    // Filtrer pour n'avoir que les Pokémon avec des notes
    const ratedPokemons = pokemons.filter(p => p.rating !== undefined && p.rating > 0);
    
    // Mélanger aléatoirement
    const shuffled = [...ratedPokemons].sort(() => 0.5 - Math.random());
    
    // Dupliquer les Pokémon pour un défilement infini
    setShuffledPokemons([...shuffled, ...shuffled]);
  }, [pokemons]);
  
  // Animation du carrousel
  useEffect(() => {
    if (!carouselRef.current || shuffledPokemons.length === 0) return;
    
    let animationId: number;
    let position = 0;
    
    const animate = () => {
      if (!carouselRef.current || isHovering) return;
      
      position -= 0.5; // Vitesse de défilement
      
      // Réinitialiser la position quand le premier ensemble est passé
      const itemWidth = 220; // Largeur approximative de chaque élément + marge
      const resetPoint = -((shuffledPokemons.length / 2) * itemWidth);
      
      if (position < resetPoint) {
        position = 0;
      }
      
      carouselRef.current.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [shuffledPokemons, isHovering]);

  // Pas de contenu si aucun Pokémon
  if (shuffledPokemons.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Popular Pokémon</h2>
        <a href="/top-rated" className="text-blue-400 hover:text-blue-300 transition text-sm">
          See all →
        </a>
      </div>
      
      <div 
        className="relative overflow-hidden py-4"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div 
          ref={carouselRef} 
          className="flex transition-transform"
          style={{ willChange: 'transform' }}
        >
          {shuffledPokemons.map((pokemon, index) => {
            // Utiliser les données du cache si disponibles
            const rating = pokemonCache[pokemon.id]?.rating ?? pokemon.rating;
            const votes = pokemonCache[pokemon.id]?.numberOfVotes ?? pokemon.numberOfVotes;
            
            // Mettre à jour les données avec celles du cache
            const updatedPokemon = {
              ...pokemon,
              rating,
              numberOfVotes: votes
            };
            
            return (
              <div key={`${pokemon.id}-${index}`} className="flex-shrink-0 w-52 mx-2">
                <PokemonCard 
                  pokemon={updatedPokemon} 
                  showRating={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}