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

export default function FavoritesContainer() {
  const { favorites, loading: globalLoading } = useGlobal();
  
  const [favoritePokemons, setFavoritePokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Effet pour charger les données des Pokémon favoris
  useEffect(() => {
    const fetchPokemonsDetails = async () => {
      // Attendre que les données globales soient chargées
      if (globalLoading) return;
      
      // Si pas de favoris, ne pas faire d'appel API
      if (!favorites.length) {
        setFavoritePokemons([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Utiliser notre nouvelle API client
        const pokemons = await clientApi.pokemon.getByIds(favorites);
        setFavoritePokemons(pokemons);
      } catch (error) {
        console.error('Error fetching favorite Pokémon details:', error);
        setError('Erreur lors du chargement des Pokémon favoris');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonsDetails();
  }, [favorites, globalLoading]);

  // Protection par authentification
  return (
    <AuthenticationGuard
      fallback={
        <EmptyState 
          message="Veuillez vous connecter pour voir vos favoris."
          actionText="Se connecter"
          actionHref="/login"
        />
      }
    >
      {loading || globalLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Chargement de vos favoris...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 rounded-lg p-6 text-center">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Réessayer
          </button>
        </div>
      ) : favoritePokemons.length === 0 ? (
        <EmptyState 
          message="Vous n'avez pas encore de Pokémon favoris."
          actionText="Explorer les Pokémon"
          actionHref="/explorer"
        />
      ) : (
        <FavoritesList pokemons={favoritePokemons} />
      )}
    </AuthenticationGuard>
  );
}