'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PokemonCard from '../../components/pokemon/PokemonCard';
import { getUserFavoritePokemons } from '../../lib/api';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': { front_default: string };
    };
  };
}

const FavoritesPage = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined;
  const accessToken = session?.accessToken;
  const [favoritePokemons, setFavoritePokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId || !accessToken) return;

      try {
        const data = await getUserFavoritePokemons(userId, accessToken)
        const pokemonIds = data.favorites;
        const pokemonDetails = await Promise.all(
          pokemonIds.map(async (id: number) => {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            return res.json();
          })
        );

        setFavoritePokemons(pokemonDetails);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId, accessToken]);

  if (!userId) {
    return <p className="text-center my-4">Veuillez vous connecter pour voir vos favoris.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Pokémon Favoris</h1>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : favoritePokemons.length === 0 ? (
        <p className="text-center">Vous n'avez pas encore de Pokémon favoris.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoritePokemons.map((pokemon) => (
            <PokemonCard 
              key={pokemon.id} 
              pokemon={pokemon} 
              userId={userId} 
              onRate={async (userId, pokedexId, rating) => {
                // Implement the rating logic here
                console.log(`User ${userId} rated Pokémon ${pokedexId} with ${rating} stars.`);
              }} // Gère la notation si nécessaire
              onFavorite={async (userId, pokedexId) => {
                // Implement the logic to remove from favorites here
                console.log(`User ${userId} removed Pokémon ${pokedexId} from favorites.`);
              }} // Peut être ajouté pour retirer des favoris
            />
          ))}
        </div>
      )}
    </div>
  );    
};

export default FavoritesPage;
