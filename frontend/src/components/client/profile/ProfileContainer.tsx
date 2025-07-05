'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useGlobal } from '@/providers/GlobalProvider';
import { api } from '@/lib/api';
import { Pokemon } from '@/types/pokemon';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import AuthenticationGuard from '@/components/client/shared/AuthenticationGuard';
import ProfileHeader from './ProfileHeader';
import FavoritesSection from './FavoritesSection';
import RatedPokemonSection from './RatedPokemonsSection';

/**
 * ProfileContainer component
 * 
 * Main container for the user profile page.
 * Fetches and displays user's favorite and rated Pokémon.
 * 
 * @returns React component
 */
export default function ProfileContainer() {
  const { data: session } = useSession();
  const { 
    favorites, 
    userRatings, 
    loading: globalLoading, 
    pokemonCache 
  } = useGlobal();
  
  const [favoritePokemons, setFavoritePokemons] = useState<Pokemon[]>([]);
  const [ratedPokemons, setRatedPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load details of favorite and rated Pokémon
  useEffect(() => {
    async function loadUserPokemon() {
      if (globalLoading || !session?.user) return;

      setLoading(true);
      try {
        // Load favorites
        if (favorites.length > 0) {
          const favPokemon = await api.pokemon.getByIds(favorites);
          setFavoritePokemons(favPokemon);
        } else {
          setFavoritePokemons([]);
        }

        // Load rated Pokémon
        if (Object.keys(userRatings).length > 0) {
          const ratedIds = Object.keys(userRatings).map(Number);
          const ratedPokemon = await api.pokemon.getByIds(ratedIds);
          setRatedPokemons(ratedPokemon);
        } else {
          setRatedPokemons([]);
        }
      } catch (error) {
        console.error('Error loading user pokemons:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserPokemon();
  }, [session, favorites, userRatings, globalLoading]);

  // Calculate average rating
  const calculateAverageRating = () => {
    const values = Object.values(userRatings);
    if (values.length === 0) return 0;
    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  };

  return (
    <AuthenticationGuard
      fallback={
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">User Profile</h2>
          <p className="mb-4">Please sign in to access your profile</p>
          <a href="/login?callbackUrl=/profile" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
            Sign in
          </a>
        </div>
      }
    >
      {loading || globalLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Loading your profile...</p>
        </div>
      ) : (
        <div className="space-y-10 animate-fade-in">
          <ProfileHeader 
            session={session}
            favoritesCount={favorites.length}
            ratedCount={Object.keys(userRatings).length}
            averageRating={calculateAverageRating()}
          />
          
          <FavoritesSection 
            pokemonList={favoritePokemons}
            userRatings={userRatings}
            pokemonCache={Object.fromEntries(
              Object.entries(pokemonCache).map(([id, poke]) => [
                id,
                {
                  rating: poke.rating ?? 0,
                  numberOfVotes: poke.numberOfVotes ?? 0,
                },
              ])
            )}
            favorites={favorites}
          />
          
          <RatedPokemonSection 
            pokemonList={ratedPokemons}
            userRatings={userRatings}
            pokemonCache={Object.fromEntries(
              Object.entries(pokemonCache).map(([id, poke]) => [
                id,
                {
                  rating: poke.rating ?? 0,
                  numberOfVotes: poke.numberOfVotes ?? 0,
                },
              ])
            )}
            favorites={favorites}
          />
        </div>
      )}
    </AuthenticationGuard>
  );
}