'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import { useGlobal } from '@/providers/GlobalProvider';
import PokemonCard from '@/components/client/shared/PokemonCard';

interface PokemonCarouselProps {
  pokemons: Pokemon[];
}

/**
 * PokemonCarousel component
 * Horizontal auto-scrolling carousel of Pokémon cards
 * 
 * @param {Object} props - Component props
 * @param {Pokemon[]} props.pokemons - Array of Pokémon to display in the carousel
 */
export default function PokemonCarousel({ pokemons }: PokemonCarouselProps) {
  const { pokemonCache } = useGlobal();
  const [shuffledPokemons, setShuffledPokemons] = useState<Pokemon[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Shuffle and filter Pokémon on load
  useEffect(() => {
    // Filter to only have Pokémon with ratings
    const ratedPokemons = pokemons.filter(p => p.rating !== undefined && p.rating > 0);
    
    // Random shuffle
    const shuffled = [...ratedPokemons].sort(() => 0.5 - Math.random());
    
    // Duplicate Pokémon for infinite scrolling
    setShuffledPokemons([...shuffled, ...shuffled]);
  }, [pokemons]);
  
  // Carousel animation
  useEffect(() => {
    if (!carouselRef.current || shuffledPokemons.length === 0) return;
    
    let animationId: number;
    let position = 0;
    
    const animate = () => {
      if (!carouselRef.current || isHovering) return;
      
      position -= 0.5; // Scroll speed
      
      // Reset position when the first set is passed
      const itemWidth = 220; // Approximate width of each item + margin
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

  // No content if no Pokémon
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
          View rankings →
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
            // Use cache data if available
            const rating = pokemonCache[pokemon.id]?.rating ?? pokemon.rating;
            const votes = pokemonCache[pokemon.id]?.numberOfVotes ?? pokemon.numberOfVotes;
            
            // Update data with cache
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
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}