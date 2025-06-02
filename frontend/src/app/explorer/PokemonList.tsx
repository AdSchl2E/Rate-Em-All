// frontend/src/app/explorer/PokemonList.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import PokemonCard from '../../components/pokemon/PokemonCard';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useRatings } from '../../contexts/RatingsContext';

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
  const userId = session?.user?.id as number | undefined;
  const { loading: favoritesLoading } = useFavorites();
  const { loading: ratingsLoading } = useRatings();
  
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

  const isDataLoading = loading || ratingsLoading || favoritesLoading;

  return (
    <div className="container mx-auto p-4">
      {!userId && (
        <p className="text-center my-4">
          Veuillez vous connecter pour noter les Pokémon et les ajouter aux favoris.
        </p>
      )}
      
      {isDataLoading && userId && (
        <div className="text-center my-4">
          <p>Chargement des données...</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pokemons.map((pokemon, index) => (
          <div key={`${pokemon.id}-${index}`} ref={index === pokemons.length - 1 ? lastPokemonRef : null}>
            <PokemonCard 
              key={`card-${pokemon.id}`}
              pokemon={pokemon} 
              userId={userId || 0} 
              showActions={true}
              showRating={true}
            />
          </div>
        ))}
      </div>
      {loading && <p className="text-center my-4">Chargement des Pokémon...</p>}
    </div>
  );
};

export default PokemonList;
