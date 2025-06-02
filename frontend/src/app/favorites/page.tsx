'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PokemonCard from '../../components/pokemon/PokemonCard';
import { ratePokemonForUser, getUserRatings } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { useFavorites } from '../../contexts/FavoritesContext';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': { front_default: string };
    };
  };
  types?: { type: { name: string } }[];
}

const FavoritesPage = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined;
  const accessToken = session?.accessToken;
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [favoritePokemons, setFavoritePokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});

  const fetchPokemonsDetails = async () => {
    if (!favorites.length) {
      setFavoritePokemons([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching details for favorites:', favorites);
      const pokemonDetails = await Promise.all(
        favorites.map(async (id: number) => {
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            if (!res.ok) {
              console.error(`Failed to fetch Pokémon ${id}: ${res.status}`);
              return null;
            }
            return res.json();
          } catch (error) {
            console.error(`Error fetching Pokémon ${id}:`, error);
            return null;
          }
        })
      );

      // Filtrer les Pokémon qui ont été récupérés avec succès
      const validPokemonDetails = pokemonDetails.filter(p => p !== null) as Pokemon[];
      console.log(`Retrieved ${validPokemonDetails.length} Pokémon details`);
      setFavoritePokemons(validPokemonDetails);
    } catch (error) {
      console.error('Error fetching Pokémon details:', error);
      toast.error("Erreur lors du chargement des détails des Pokémon");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    if (!userId || !accessToken) return;

    try {
      const ratingsData = await getUserRatings(userId, accessToken);
      const ratings: Record<number, number> = {};
      
      if (ratingsData.ratings) {
        ratingsData.ratings.forEach((rating: { pokemonId: number, rating: number }) => {
          ratings[rating.pokemonId] = rating.rating;
        });
      }
      setUserRatings(ratings);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    }
  };

  // Charger les détails des Pokémon quand les favoris changent
  useEffect(() => {
    fetchPokemonsDetails();
  }, [favorites]);

  // Charger les notations de l'utilisateur
  useEffect(() => {
    fetchUserRatings();
  }, [userId, accessToken]);

  const handleRate = async (userId: number, pokedexId: number, rating: number) => {
    if (!accessToken) {
      toast.error('Veuillez vous connecter pour noter ce Pokémon');
      return;
    }
  
    try {
      await ratePokemonForUser(userId, pokedexId, rating, accessToken);
      
      // Mettre à jour les ratings de l'utilisateur dans l'état local
      setUserRatings(prev => ({
        ...prev,
        [pokedexId]: rating
      }));
    } catch (error) {
      console.error('Error rating pokemon:', error);
      toast.error("Une erreur s'est produite lors de la notation");
    }
  };

  if (!userId) {
    return <p className="text-center my-4">Veuillez vous connecter pour voir vos favoris.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Pokémon Favoris</h1>

      {(loading || favoritesLoading) ? (
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
              onRate={handleRate}
              userRating={userRatings[pokemon.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );    
};

export default FavoritesPage;
