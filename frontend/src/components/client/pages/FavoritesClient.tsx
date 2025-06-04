'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFavorites } from '../../../providers/FavoritesProvider';
import { useRatings } from '../../../providers/RatingsProvider';
import { ClientPokemonCard } from '../pokemon/ClientPokemonCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pokemon } from '../../../types/pokemon';
import { fetchPokemonsByIds } from '../../../lib/api-client/pokemon';
import Link from 'next/link';

export function FavoritesClient() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id as number | undefined;
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { loading: ratingsLoading } = useRatings();
  
  const [favoritePokemons, setFavoritePokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemonsDetails = async () => {
      if (favoritesLoading) {
        return; // Attendre que les favoris soient chargés
      }
      
      if (!favorites.length) {
        setFavoritePokemons([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const pokemons = await fetchPokemonsByIds(favorites);
        setFavoritePokemons(pokemons);
      } catch (error) {
        console.error('Error fetching Pokémon details:', error);
        setError('Erreur lors du chargement des Pokémon favoris');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonsDetails();
  }, [favorites, favoritesLoading]);

  // Si l'utilisateur n'est pas connecté
  if (status === 'unauthenticated') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="mb-4">Veuillez vous connecter pour voir vos favoris.</p>
        <Link 
          href="/login"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  // État de chargement
  if (status === 'loading' || loading || favoritesLoading || ratingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <LoadingSpinner />
        <p className="mt-4 text-gray-400">Chargement de vos favoris...</p>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="bg-red-900/30 rounded-lg p-6 text-center">
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Aucun favori
  if (favoritePokemons.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="mb-4">Vous n'avez pas encore de Pokémon favoris.</p>
        <Link 
          href="/explorer"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Explorer les Pokémon
        </Link>
      </div>
    );
  }

  // Affichage des favoris
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {favoritePokemons.map((pokemon) => (
        <ClientPokemonCard 
          key={pokemon.id}
          pokemon={pokemon}
          showActions={true}
          showRating={true}
        />
      ))}
    </div>
  );
}