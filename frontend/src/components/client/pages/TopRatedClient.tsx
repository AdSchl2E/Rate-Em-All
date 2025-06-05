'use client';

import { useState, useMemo, useEffect } from 'react';
import { ClientPokemonCard } from '../pokemon/ClientPokemonCard';
import { Pokemon } from '../../../types/pokemon';
import { typeColors } from '../../../lib/utils/pokemonTypes';
import { StarIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { ClientStarRating } from '../ui/ClientStarRating';
import Image from 'next/image';
import Link from 'next/link';
import { useGlobal } from '../../../providers/GlobalProvider';
import { CommunityRating } from '../ui/CommunityRating';
import { fetchTopRated } from '../../../lib/api-server/pokemon';
import { useSession } from 'next-auth/react';

interface TopRatedClientProps {
  initialPokemons: Pokemon[];
}

export function TopRatedClient({ initialPokemons }: TopRatedClientProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'votes' | 'name'>('rating');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { pokemonCache, userRatings } = useGlobal();
  const { data: session } = useSession();
  
  // State for storing all Pokémon data (initial + any updates)
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>(initialPokemons);
  
  // Track user ratings changes to trigger refresh when needed
  const [lastRatingTimestamp, setLastRatingTimestamp] = useState<number>(0);
  
  // Effect to refresh data when a rating changes
  useEffect(() => {
    const refreshTopRated = async () => {
      try {
        // Only refresh if a rating has been made (lastRatingTimestamp > 0)
        if (lastRatingTimestamp > 0) {
          console.log('Refreshing top rated Pokémon after new rating');
          const freshTopRated = await fetchTopRated(50);
          setAllPokemons(freshTopRated);
        }
      } catch (error) {
        console.error('Failed to refresh top rated Pokémon:', error);
      }
    };

    refreshTopRated();
  }, [lastRatingTimestamp]);
  
  // Watch for changes in userRatings to detect new ratings
  useEffect(() => {
    setLastRatingTimestamp(Date.now());
  }, [userRatings]);
  
  // Extraire tous les types uniques de Pokémon
  const pokemonTypes = useMemo(() => {
    const types = new Set<string>();
    types.add('all');
    
    allPokemons.forEach(pokemon => {
      pokemon.types?.forEach(typeObj => {
        types.add(typeObj.type.name);
      });
    });
    
    return Array.from(types).sort();
  }, [allPokemons]);
  
  // Préparer les Pokémon avec les données du cache
  const enhancedPokemons = useMemo(() => {
    return allPokemons.map(pokemon => ({
      ...pokemon,
      rating: pokemonCache[pokemon.id]?.rating ?? pokemon.rating,
      numberOfVotes: pokemonCache[pokemon.id]?.numberOfVotes ?? pokemon.numberOfVotes
    }));
  }, [allPokemons, pokemonCache]);
  
  // Filtrer et trier les Pokémon
  const displayedPokemons = useMemo(() => {
    // Filtrer par type si nécessaire
    let filtered = enhancedPokemons;
    if (typeFilter !== 'all') {
      filtered = enhancedPokemons.filter(pokemon => 
        pokemon.types?.some(typeObj => typeObj.type.name === typeFilter)
      );
    }
    
    // Trier selon le critère choisi
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'votes':
          return (b.numberOfVotes || 0) - (a.numberOfVotes || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [enhancedPokemons, typeFilter, sortBy]);

  // Séparation pour le podium et la liste
  const podiumPokemons = displayedPokemons.slice(0, 3);
  const listPokemons = displayedPokemons.slice(3, 10);
  
  return (
    <div className="mt-12 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* Filtres par type */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Type:</span>
            <div className="flex flex-wrap gap-2 max-w-lg">
              {pokemonTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors
                    ${typeFilter === type 
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Options de tri */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'votes' | 'name')}
              className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm"
            >
              <option value="rating">Meilleure note</option>
              <option value="votes">Nombre de votes</option>
              <option value="name">Nom</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Affichage des résultats et du nombre */}
      <div className="text-sm text-gray-400 mb-4">
        {displayedPokemons.length} Pokémon {typeFilter !== 'all' ? `de type ${typeFilter}` : ''} 
      </div>
      
      {/* PODIUM DES MEILLEURS */}
      {podiumPokemons.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center">
            <TrophyIcon className="h-8 w-8 mr-2 text-yellow-400" />
            Podium des meilleurs Pokémon
          </h2>
          
          <div className="flex flex-col md:flex-row justify-center items-end gap-4 mx-auto max-w-5xl">
            {/* 2ème place */}
            {podiumPokemons.length >= 2 && (
              <div className="order-1 md:order-1 w-full md:w-1/3 flex flex-col items-center">
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 w-16 h-16 rounded-full mb-3 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">2</span>
                </div>
                
                <div className="bg-gray-800 rounded-t-xl w-full p-4 pt-0 relative">
                  <div className="h-32 flex items-center justify-center -mt-16">
                    <Link href={`/pokemon/${podiumPokemons[1]?.id}`}>
                      <Image
                        src={podiumPokemons[1]?.sprites.other?.['official-artwork']?.front_default || podiumPokemons[1]?.sprites.front_default || '/placeholder.png'}
                        width={120}
                        height={120}
                        alt={podiumPokemons[1]?.name || ''}
                        className="drop-shadow-xl"
                      />
                    </Link>
                  </div>
                  
                  <h3 className="text-center text-xl font-semibold capitalize mb-1">
                    <Link href={`/pokemon/${podiumPokemons[1]?.id}`} className="hover:text-blue-400 transition">
                      {podiumPokemons[1]?.name}
                    </Link>
                  </h3>
                  
                  <div className="flex justify-center mb-2">
                    {podiumPokemons[1]?.types?.map((typeObj, idx) => {
                      const type = typeObj.type.name;
                      return (
                        <span
                          key={idx}
                          className="badge px-2 py-1 text-xs text-white font-medium mx-1"
                          style={{ backgroundColor: typeColors[type] }}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <CommunityRating
                      rating={podiumPokemons[1]?.rating || 0}
                      votes={podiumPokemons[1]?.numberOfVotes || 0}
                      size="md"
                      showStars={false}
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 h-24 w-full rounded-b-xl flex items-center justify-center">
                  <div className="text-2xl font-bold text-gray-300">2</div>
                </div>
              </div>
            )}
            
            {/* 1ère place */}
            {podiumPokemons.length >= 1 && (
              <div className="order-0 md:order-0 w-full md:w-1/3 flex flex-col items-center mb-0 md:-mb-6 z-10">
                
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-20 h-20 rounded-full mb-3 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">1</span>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl w-full p-4 pt-0 relative shadow-xl border border-yellow-500/30">
                  <div className="h-36 flex items-center justify-center -mt-20">
                    <Link href={`/pokemon/${podiumPokemons[0]?.id}`}>
                      <Image
                        src={podiumPokemons[0]?.sprites.other?.['official-artwork']?.front_default || podiumPokemons[0]?.sprites.front_default || '/placeholder.png'}
                        width={140}
                        height={140}
                        alt={podiumPokemons[0]?.name || ''}
                        className="drop-shadow-xl"
                      />
                    </Link>
                  </div>
                  
                  <h3 className="text-center text-2xl font-bold capitalize mb-2">
                    <Link href={`/pokemon/${podiumPokemons[0]?.id}`} className="hover:text-blue-400 transition">
                      {podiumPokemons[0]?.name}
                    </Link>
                  </h3>
                  
                  <div className="flex justify-center mb-2">
                    {podiumPokemons[0]?.types?.map((typeObj, idx) => {
                      const type = typeObj.type.name;
                      return (
                        <span
                          key={idx}
                          className="badge px-3 py-1 text-white font-medium mx-1"
                          style={{ backgroundColor: typeColors[type] }}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <CommunityRating
                      rating={podiumPokemons[0]?.rating || 0}
                      votes={podiumPokemons[0]?.numberOfVotes || 0}
                      size="lg"
                      showStars={false}
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 h-32 w-full rounded-b-xl flex items-center justify-center">
                  <div className="text-3xl font-bold text-white">1</div>
                </div>
              </div>
            )}
            
            {/* 3ème place */}
            {podiumPokemons.length >= 3 && (
              <div className="order-2 md:order-2 w-full md:w-1/3 flex flex-col items-center">
                <div className="bg-gradient-to-br from-amber-700 to-amber-800 w-14 h-14 rounded-full mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                
                <div className="bg-gray-800 rounded-t-xl w-full p-4 pt-0 relative">
                  <div className="h-28 flex items-center justify-center -mt-14">
                    <Link href={`/pokemon/${podiumPokemons[2]?.id}`}>
                      <Image
                        src={podiumPokemons[2]?.sprites.other?.['official-artwork']?.front_default || podiumPokemons[2]?.sprites.front_default || '/placeholder.png'}
                        width={100}
                        height={100}
                        alt={podiumPokemons[2]?.name || ''}
                        className="drop-shadow-xl"
                      />
                    </Link>
                  </div>
                  
                  <h3 className="text-center text-lg font-medium capitalize mb-1">
                    <Link href={`/pokemon/${podiumPokemons[2]?.id}`} className="hover:text-blue-400 transition">
                      {podiumPokemons[2]?.name}
                    </Link>
                  </h3>
                  
                  <div className="flex justify-center mb-2">
                    {podiumPokemons[2]?.types?.map((typeObj, idx) => {
                      const type = typeObj.type.name;
                      return (
                        <span
                          key={idx}
                          className="badge px-2 py-0.5 text-xs text-white font-medium mx-1"
                          style={{ backgroundColor: typeColors[type] }}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <CommunityRating
                      rating={podiumPokemons[2]?.rating || 0}
                      votes={podiumPokemons[2]?.numberOfVotes || 0}
                      size="md"
                      showStars={false}
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-800 to-amber-900 h-20 w-full rounded-b-xl flex items-center justify-center">
                  <div className="text-xl font-bold text-amber-200">3</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* LISTE DES POSITIONS 4-10 - Modern design without table headers */}
      {listPokemons.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            Les autres meilleurs Pokémon
          </h3>
          
          <div className="space-y-3">
            {listPokemons.map((pokemon, idx) => (
              <div 
                key={pokemon.id} 
                className="bg-gray-800/80 hover:bg-gray-700 transition rounded-lg shadow-lg overflow-hidden flex items-center"
              >
                {/* Rank number */}
                <div className="p-4 flex-shrink-0 w-16 font-bold text-2xl text-center bg-gradient-to-br from-gray-800 to-gray-900">
                  {idx + 4}
                </div>
                
                {/* Pokémon info */}
                <Link href={`/pokemon/${pokemon.id}`} className="flex items-center flex-grow p-3 hover:text-blue-400 transition">
                  <div className="w-12 h-12 mr-4 bg-gray-700/50 rounded-full overflow-hidden flex items-center justify-center">
                    <Image 
                      src={pokemon.sprites.front_default || '/placeholder.png'} 
                      alt={pokemon.name}
                      width={48}
                      height={48}
                    />
                  </div>
                  
                  <div>
                    <div className="font-medium capitalize text-lg">{pokemon.name}</div>
                    
                    {/* Types */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pokemon.types?.map((typeObj, typeIdx) => {
                        const type = typeObj.type.name;
                        return (
                          <span
                            key={typeIdx}
                            className="badge px-2 py-0.5 text-xs text-white font-medium"
                            style={{ backgroundColor: typeColors[type] }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Link>
                
                {/* Rating & votes info */}
                <div className="mr-6 flex gap-4 items-center">
                  <div>
                    <CommunityRating
                      rating={pokemon.rating || 0}
                      votes={pokemon.numberOfVotes || 0}
                      size="md"
                      showVotes={true}
                      prominent={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Affichage des autres Pokémon (après le top 10) */}
      {displayedPokemons.length > 10 && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Autres Pokémon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedPokemons.slice(10).map((pokemon) => (
              <ClientPokemonCard 
                key={pokemon.id}
                pokemon={pokemon}
                showActions={true}
                showRating={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}