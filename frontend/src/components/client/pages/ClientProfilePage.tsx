'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { HeartIcon, StarIcon } from '@heroicons/react/24/solid';
import { UserIcon } from '@heroicons/react/24/outline';
import { ClientStarRating } from '../ui/ClientStarRating';
import { useGlobal } from '../../../providers/GlobalProvider';
import { fetchPokemonsByIds } from '../../../lib/api-client/pokemon';
import { Pokemon } from '../../../types/pokemon';
import { typeColors } from '../../../lib/utils/pokemonTypes';
import { CommunityRating } from '../ui/CommunityRating';
import { getRatingColor } from '../../../lib/utils/ratingColors';

export function ClientProfilePage() {
  const { data: session } = useSession();
  const { favorites, userRatings, loading: globalLoading, pokemonCache } = useGlobal();
  
  const [favoritePokemons, setFavoritePokemons] = useState<Pokemon[]>([]);
  const [ratedPokemons, setRatedPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Count rated Pokémon
  const ratedPokemonCount = userRatings ? Object.keys(userRatings).length : 0;

  // Get user info
  const userId = session?.user?.id;
  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image;
  
  // Charger les détails des Pokémon favoris et notés
  useEffect(() => {
    async function loadUserPokemon() {
      if (globalLoading || !session?.user) return;
      
      setLoading(true);
      try {
        // Charger les favoris
        if (favorites.length > 0) {
          const favPokemon = await fetchPokemonsByIds(favorites);
          setFavoritePokemons(favPokemon);
        }
        
        // Charger les Pokémon notés
        if (Object.keys(userRatings).length > 0) {
          const ratedIds = Object.keys(userRatings).map(Number);
          const ratedPokemon = await fetchPokemonsByIds(ratedIds);
          setRatedPokemons(ratedPokemon);
        }
      } catch (error) {
        console.error('Error loading user pokemons:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserPokemon();
  }, [session, favorites, userRatings, globalLoading]);
  
  // Loading states
  if (!session) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Profile page</h1>
        <p>Please login to see your profile</p>
        <Link href="/login" className="btn btn-primary mt-4 inline-block">
          Login
        </Link>
      </div>
    );
  }

  if (loading || globalLoading) {
    return <LoadingSpinner />;
  }

  // Calculate average rating
  const calculateAverageRating = (ratings: Record<number, number>) => {
    const values = Object.values(ratings);
    if (values.length === 0) return 0;
    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  };

  return (
    <div className="mx-auto animate-fade-in"> {/* Supprimé max-width */}
      {/* Profile header */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500">
            {userImage ? (
              <Image 
                src={userImage} 
                width={96} 
                height={96} 
                alt={`${userName}'s avatar`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
          
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">{userName}</h1>
            <p className="text-gray-400 mt-1">{session?.user?.email}</p>
            
            {/* User stats */}
            <div className="flex gap-6 mt-4 text-center">
              <div>
                <div className="text-2xl font-bold">{favorites?.length || 0}</div>
                <div className="text-sm text-gray-400">Favorites</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{ratedPokemonCount}</div>
                <div className="text-sm text-gray-400">Rated</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {userRatings && Object.keys(userRatings).length > 0 ? calculateAverageRating(userRatings).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-400">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites section with ratings */}
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
        Your Favorites
      </h2>
      
      {favoritePokemons.length > 0 ? (
        <div className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favoritePokemons.slice(0, 10).map(pokemon => (
              <div key={pokemon.id} className="bg-gray-800 hover:bg-gray-700 transition rounded-lg overflow-hidden">
                <Link href={`/pokemon/${pokemon.id}`} className="block">
                  {/* Type background gradient */}
                  <div className="relative h-32 flex items-center justify-center">
                    {/* Background couleur selon le type */}
                    {pokemon.types && pokemon.types[0] && (
                      <div className="absolute inset-0 opacity-20" 
                        style={{ 
                          background: `radial-gradient(circle at center, ${typeColors[pokemon.types[0].type.name] || '#777'} 0%, transparent 70%)` 
                        }}
                      ></div>
                    )}
                    <Image
                      src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/placeholder.png'}
                      alt={pokemon.name}
                      width={90}
                      height={90}
                      className="object-contain z-10"
                    />
                    
                    {/* Types badges */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-1 gap-1">
                      {pokemon.types?.map((typeObj, idx) => {
                        const type = typeObj.type.name;
                        return (
                          <span 
                            key={idx}
                            className="badge text-xs px-2 py-0.5 text-white font-medium"
                            style={{ backgroundColor: typeColors[type] || '#AAAAAA' }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-center font-medium capitalize mb-2">{pokemon.name}</h3>
                    
                    {/* Ratings footer - Similar to PokemonCard */}
                    <div className="flex items-center justify-between px-2">
                      {/* User Rating */}
                      <div className={`flex items-center ${getRatingColor(userRatings[pokemon.id] || 0)}`}>
                        <ClientStarRating 
                          value={userRatings[pokemon.id] || 0} 
                          fixed={true} 
                          size="sm"
                          useColors={true} 
                        />
                      </div>
                      
                      {/* Community Rating */}
                      <CommunityRating
                        rating={pokemonCache[pokemon.id]?.rating || pokemon.rating || 0}
                        votes={pokemonCache[pokemon.id]?.numberOfVotes || pokemon.numberOfVotes || 0}
                        size="sm"
                        showStars={false}
                        showVotes={false}
                        prominent={true}
                      />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {favoritePokemons.length > 10 && (
            <div className="text-center mt-6">
              <Link href="/favoris" className="text-blue-400 hover:text-blue-300 font-medium">
                Voir les {favoritePokemons.length - 10} autres favoris →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-8 text-center mb-12">
          <p className="text-gray-400 mb-4">You haven't added any Pokémon to your favorites yet.</p>
          <Link href="/explorer" className="btn btn-primary">
            Explore Pokémon
          </Link>
        </div>
      )}

      {/* User ratings section - Modern card list rather than a table */}
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <StarIcon className="h-6 w-6 mr-2 text-amber-500" />
        Your Ratings
      </h2>
      
      {ratedPokemons.length > 0 ? (
        <div className="space-y-3">
          {ratedPokemons
            .sort((a, b) => (userRatings[b.id] || 0) - (userRatings[a.id] || 0))
            .map((pokemon, idx) => (
              <div 
                key={pokemon.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-800/70"} hover:bg-gray-700 transition`}
              >
                {/* Pokémon info with image, name and types */}
                <Link href={`/pokemon/${pokemon.id}`} className="flex items-center gap-3 flex-grow hover:text-blue-400 transition">
                  <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    <Image 
                      src={pokemon.sprites.front_default || '/placeholder.png'} 
                      alt={pokemon.name}
                      width={48}
                      height={48}
                    />
                  </div>
                  
                  <div>
                    <span className="capitalize font-medium">{pokemon.name}</span>
                    
                    {/* Types */}
                    <div className="flex gap-1 mt-1">
                      {pokemon.types?.map((typeObj, typeIdx) => {
                        const type = typeObj.type.name;
                        return (
                          <span
                            key={typeIdx}
                            className="badge px-1.5 py-0.5 text-xs text-white font-medium"
                            style={{ backgroundColor: typeColors[type] }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Link>
                
                {/* Ratings section */}
                <div className="flex items-center gap-6">
                  {/* User rating */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <ClientStarRating value={userRatings[pokemon.id] || 0} fixed={true} size="sm" useColors={true} />
                    </div>
                    <span className={`text-sm font-medium ${getRatingColor(userRatings[pokemon.id] || 0)}`}>
                      Ma note: {userRatings[pokemon.id]}
                    </span>
                  </div>
                  
                  {/* Community rating */}
                  <div>
                    <CommunityRating
                      rating={pokemonCache[pokemon.id]?.rating || pokemon.rating || 0}
                      votes={pokemonCache[pokemon.id]?.numberOfVotes || pokemon.numberOfVotes || 0}
                      size="md"
                      showStars={false}
                      prominent={true}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">You haven't rated any Pokémon yet.</p>
          <Link href="/explorer" className="btn btn-primary">
            Rate Some Pokémon
          </Link>
        </div>
      )}
    </div>
  );
}