'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import PokemonCard from '../../components/pokemon/PokemonCard';
import { ratePokemon as ratePokemonAPI } from '../../lib/api';

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
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Récupération par lot depuis l'API pokeapi
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

  // Détection de la fin de liste pour charger plus de Pokémon
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

  // Fonction de rating qui utilise la fonction d'api centralisée
  const handleRate = async (pokemonId: number, rating: number) => {
    try {
      const data = await ratePokemonAPI(pokemonId, rating);
      console.log('Rating updated:', data);
    } catch (error) {
      console.error('Error rating pokemon:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pokemons.map((pokemon, index) => (
          <div key={`${pokemon.id}-${index}`} ref={index === pokemons.length - 1 ? lastPokemonRef : null}>
            <PokemonCard pokemon={pokemon} onRate={handleRate} />
          </div>
        ))}
      </div>
      {loading && <p className="text-center my-4">Loading more Pokémon...</p>}
    </div>
  );
};

export default PokemonList;
