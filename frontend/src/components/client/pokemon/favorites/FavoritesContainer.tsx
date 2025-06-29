'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import { Pokemon } from '@/types/pokemon';
import clientApi from '@/lib/api/client';
import { useGlobal } from '@/providers/GlobalProvider';

import AuthenticationGuard from '../../shared/AuthenticationGuard';
import EmptyState from './EmptyState';
import FavoritesList from './FavoritesList';

/**
 * FavoritesContainer component
 * Container for user's favorite Pokémon with authentication check
 * Loads and displays favorite Pokémon data from API
 */
export default function FavoritesContainer() {
  const { favorites, loading: globalLoading } = useGlobal();
  
  const [favoritePokemons, setFavoritePokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to load favorite Pokémon data
  useEffect(() => {
    const fetchPokemonsDetails = async () => {
      // Wait for global data to load
      if (globalLoading) return;
      
      // Don't make API call if no favorites
      if (!favorites.length) {
        setFavoritePokemons([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use our client API
        const pokemons = await clientApi.pokemon.getByIds(favorites);
        setFavoritePokemons(pokemons);
      } catch (error) {
        console.error('Error fetching favorite Pokémon details:', error);
        setError('Error loading favorite Pokémon');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonsDetails();
  }, [favorites, globalLoading]);

  // Authentication protection
  return (
    <AuthenticationGuard
      fallback={
        <EmptyState 
          message="Please log in to see your favorites."
          actionText="Log in"
          actionHref="/login"
        />
      }
    >
      {loading || globalLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Loading your favorites...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 rounded-lg p-6 text-center">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Try again
          </button>
        </div>
      ) : favoritePokemons.length === 0 ? (
        <EmptyState 
          message="You don't have any favorite Pokémon yet."
          actionText="Explore Pokémon"
          actionHref="/explorer"
        />
      ) : (
        <FavoritesList pokemons={favoritePokemons} />
      )}
    </AuthenticationGuard>
  );
}