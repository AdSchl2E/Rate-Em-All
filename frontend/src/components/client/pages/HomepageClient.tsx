'use client';

import { useEffect, useState, useRef } from 'react';
import { Pokemon } from '../../../types/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import { ClientStarRating } from '../ui/ClientStarRating';
import { CommunityRating } from '../ui/CommunityRating';
import { useGlobal } from '../../../providers/GlobalProvider';
import { typeColors } from '../../../lib/utils/pokemonTypes';

interface HomepageClientProps {
  pokemons: Pokemon[];
}

export function HomepageClient({ pokemons }: HomepageClientProps) {
  const { pokemonCache } = useGlobal();
  const [shuffledPokemons, setShuffledPokemons] = useState<Pokemon[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Mélanger les Pokémon au chargement
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
      if (!carouselRef.current) return;
      
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
  }, [shuffledPokemons]);

  return (
    <div className="my-12 animate-fade-in">
      
      {/* Carrousel infini */}
      <div className="relative overflow-hidden py-4">
        <div 
          ref={carouselRef} 
          className="flex transition-transform"
          style={{ willChange: 'transform' }}
        >
          {shuffledPokemons.map((pokemon, index) => {
            const mainType = pokemon.types?.[0]?.type.name || 'normal';
            const gradientColor = typeColors[mainType] || '#AAAAAA';
            
            // Utiliser les données du cache si disponibles
            const rating = pokemonCache[pokemon.id]?.rating ?? pokemon.rating;
            const votes = pokemonCache[pokemon.id]?.numberOfVotes ?? pokemon.numberOfVotes;
            
            return (
              <div key={`${pokemon.id}-${index}`} className="flex-shrink-0 w-52 mx-2">
                <Link 
                  href={`/pokemon/${pokemon.id}`}
                  className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition"
                >
                  <div className="h-40 flex items-center justify-center p-2" 
                    style={{background: `linear-gradient(135deg, ${gradientColor}40 0%, ${gradientColor}10 100%)`}}>
                    <Image
                      src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/placeholder.png'}
                      alt={pokemon.name}
                      width={120}
                      height={120}
                      className="object-contain drop-shadow-md transition-transform group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-center font-medium capitalize mb-2">{pokemon.name}</h3>
                    
                    <div className="flex flex-wrap justify-center gap-1 mb-2">
                      {pokemon.types?.map((typeObj, idx) => {
                        const type = typeObj.type.name;
                        return (
                          <span
                            key={idx}
                            className="badge px-2 py-0.5 text-xs text-white font-medium"
                            style={{ backgroundColor: typeColors[type] }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-center items-center mt-3">
                      <CommunityRating
                        rating={rating || 0}
                        votes={votes || 0}
                        size="md" // Augmenté de sm à md
                        showStars={false}
                        prominent={true} // Ajout du style prominent
                      />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}