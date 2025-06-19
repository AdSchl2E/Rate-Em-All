'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';
import PokemonCard from '@/components/client/shared/PokemonCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface RandomPokemonShowcaseProps {
  pokemons: Pokemon[];
}

export default function RandomPokemonShowcase({ pokemons }: RandomPokemonShowcaseProps) {
  const [shuffledPokemons, setShuffledPokemons] = useState<Pokemon[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState(4);
  
  // Adapter le nombre de cartes visibles en fonction de la largeur d'écran
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
  
  // Mélanger les Pokémon au chargement
  useEffect(() => {
    // Filtrer pour n'avoir que les Pokémon avec des notes
    const ratedPokemons = pokemons.filter(p => p.rating !== undefined && p.rating > 0);
    
    // Mélanger aléatoirement
    const shuffled = [...ratedPokemons].sort(() => 0.5 - Math.random());
    setShuffledPokemons(shuffled);
  }, [pokemons]);
  
  // Pas d'affichage si aucun Pokémon
  if (shuffledPokemons.length === 0) return null;
  
  // Fonctions de navigation
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
  
  // Calculer les Pokémon actuellement visibles
  const visiblePokemons = shuffledPokemons.slice(activeIndex, activeIndex + visibleCards);
  
  // Compléter avec des Pokémon du début si nécessaire
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
        <h2 className="text-2xl font-bold">Découvrez des Pokémon</h2>
        <a href="/explorer" className="text-blue-400 hover:text-blue-300 transition text-sm">
          Voir tous →
        </a>
      </div>
      
      <div className="relative" ref={containerRef}>
        {/* Contrôles de navigation */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gray-800/80 hover:bg-gray-700 rounded-full p-2 shadow-lg"
          aria-label="Précédent"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gray-800/80 hover:bg-gray-700 rounded-full p-2 shadow-lg"
          aria-label="Suivant"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
        
        {/* Grille de cartes */}
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
      
      {/* Indicateurs de pagination */}
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