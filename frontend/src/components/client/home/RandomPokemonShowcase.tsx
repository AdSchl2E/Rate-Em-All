'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import PokemonCard from '@/components/client/shared/PokemonCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface RandomPokemonShowcaseProps {
  pokemons: Pokemon[];
}

/**
 * RandomPokemonShowcase component
 * Showcases a randomized set of Pokémon with navigation controls
 * 
 * @param {Object} props - Component props
 * @param {Pokemon[]} props.pokemons - Array of Pokémon to showcase
 */
export default function RandomPokemonShowcase({ pokemons }: RandomPokemonShowcaseProps) {
  const [shuffledPokemons, setShuffledPokemons] = useState<Pokemon[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState(4);
  
  // Adjust the number of visible cards based on screen width
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 768) {
        setVisibleCards(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(3);
      } else {
        setVisibleCards(4);
      }
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Shuffle Pokémon on load
  useEffect(() => {
    // Filter to only have Pokémon with ratings
    const ratedPokemons = pokemons.filter(p => p.rating !== undefined && p.rating > 0);
    
    // Random shuffle
    const shuffled = [...ratedPokemons].sort(() => 0.5 - Math.random());
    setShuffledPokemons(shuffled);
  }, [pokemons]);
  
  // No display if no Pokémon
  if (shuffledPokemons.length === 0) return null;
  
  // Navigation functions
  const handleNext = () => {
    setActiveIndex(prevIndex => 
      prevIndex + visibleCards >= shuffledPokemons.length 
        ? 0 
        : prevIndex + visibleCards
    );
  };
  
  const handlePrev = () => {
    setActiveIndex(prevIndex => 
      prevIndex - visibleCards < 0 
        ? Math.max(0, shuffledPokemons.length - visibleCards) 
        : prevIndex - visibleCards
    );
  };
  
  // Calculate currently visible Pokémon
  const visiblePokemons = shuffledPokemons.slice(activeIndex, activeIndex + visibleCards);
  
  // Fill with Pokémon from the start if needed
  const displayPokemons = visiblePokemons.length < visibleCards 
    ? [...visiblePokemons, ...shuffledPokemons.slice(0, visibleCards - visiblePokemons.length)]
    : visiblePokemons;
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Discover Pokémon</h2>
        <a href="/explorer" className="text-blue-400 hover:text-blue-300 transition text-sm">
          View all →
        </a>
      </div>
      
      <div className="relative" ref={containerRef}>
        {/* Navigation controls */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gray-800/80 hover:bg-gray-700 rounded-full p-2 shadow-lg"
          aria-label="Previous"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gray-800/80 hover:bg-gray-700 rounded-full p-2 shadow-lg"
          aria-label="Next"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
        
        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayPokemons.map((pokemon, index) => (
            <motion.div
              key={`${pokemon.id}-${activeIndex}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <PokemonCard 
                pokemon={pokemon}
                viewMode="grid"
                showRating={true}
              />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Pagination indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: Math.ceil(shuffledPokemons.length / visibleCards) }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx * visibleCards)}
            className={`h-2 rounded-full transition-all ${
              idx * visibleCards === activeIndex ? "w-6 bg-blue-500" : "w-2 bg-gray-600"
            }`}
            aria-label={`Page ${idx + 1}`}
          />
        ))}
      </div>
    </motion.section>
  );
}