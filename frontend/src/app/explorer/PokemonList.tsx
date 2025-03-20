// frontend/src/app/explorer/PokemonList.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import PokemonCard from '../../components/pokemon/PokemonCard';
import { ratePokemonForUser, setFavoritePokemonForUser, getUserFavoritePokemons } from '../../lib/api';

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

const PAGE_SIZE = 20;

const PokemonList = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined; // Assurez-vous que l'ID est un nombre
  const accessToken = session?.accessToken; // Récupérer le token directement ici
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPokemons = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`);
      const data = await response.json();

      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon: { url: string }) => {
          const res = await fetch(pokemon.url);
          return res.json();
        })
      );
      setPokemons((prev) => [...prev, ...pokemonDetails]);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (error) {
      console.error("Failed to fetch Pokémons:", error);
    } finally {
      setLoading(false);
    }
  }, [offset, loading]);

  useEffect(() => {
    fetchPokemons();
  }, []);

  const lastPokemonRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchPokemons();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, fetchPokemons]
  );

  const handleRate = async (userId: number, pokedexId: number, rating: number) => {
    
    if (!accessToken) {
      console.error('No access token available');
      return;
    }
  
    try {
      const data = await ratePokemonForUser(userId, pokedexId, rating, accessToken); // Pass token here
      console.log('Rating updated:', data);
    } catch (error) {
      console.error('Error rating pokemon:', error);
    }
  };

  const handleFavorite = async (userId: number, pokedexId: number) => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }
  
    try {
      const data = await setFavoritePokemonForUser(userId, pokedexId, accessToken);
      console.log('Favorite status updated:', data);
    } catch (error) {
      console.error("Erreur lors du changement d'état favori", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {!userId && (
        <p className="text-center my-4">
          Veuillez vous connecter pour noter les Pokémon.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pokemons.map((pokemon, index) => (
          <div key={`${pokemon.id}-${index}`} ref={index === pokemons.length - 1 ? lastPokemonRef : null}>
            <PokemonCard 
              pokemon={pokemon} 
              userId={userId || 0} 
              onRate={handleRate} 
              onFavorite={handleFavorite} 
            />
          </div>
        ))}
      </div>
      {loading && <p className="text-center my-4">Loading more Pokémon...</p>}
    </div>
  );
};

export default PokemonList;
