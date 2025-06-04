'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ClientPokemonCard } from '../pokemon/ClientPokemonCard';
import { useFavorites } from '../../../providers/FavoritesProvider';
import { useRatings } from '../../../providers/RatingsProvider';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Pokemon } from '../../../types/pokemon';

const PAGE_SIZE = 20;

export function ClientPokemonExplorer() {
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined;
  const { loading: favoritesLoading } = useFavorites();
  const { loading: ratingsLoading } = useRatings();
  
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Set pour suivre les Pokémon déjà chargés
  const loadedIds = useRef(new Set<number>());

  const fetchPokemons = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Utilisation du nouvel endpoint API optimisé
      const response = await fetch(`/api/pokemons/list?page=${Math.floor(offset/PAGE_SIZE)}&limit=${PAGE_SIZE}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des Pokémon');
      const data = await response.json();

      // Filtrer les Pokémon déjà chargés
      const newPokemons = data.pokemons.filter(
        (pokemon: Pokemon) => !loadedIds.current.has(pokemon.id)
      );
      
      // Ajouter les nouveaux IDs au Set
      newPokemons.forEach((pokemon: Pokemon) => loadedIds.current.add(pokemon.id));
      
      setPokemons(prev => [...prev, ...newPokemons]);
      setOffset(prev => prev + PAGE_SIZE);
      
      if (!initialLoadDone) {
        setInitialLoadDone(true);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }, [offset, loading, initialLoadDone]);

  useEffect(() => {
    if (!initialLoadDone) {
      fetchPokemons();
    }
  }, [initialLoadDone, fetchPokemons]);

  const lastPokemonRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !initialLoadDone) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchPokemons();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, fetchPokemons, initialLoadDone]
  );

  const isDataLoading = loading || ratingsLoading || favoritesLoading;

  return (
    <div>
      {!userId && (
        <p className="text-center my-4 bg-gray-800 p-4 rounded-lg">
          Connectez-vous pour noter les Pokémon et les ajouter aux favoris
        </p>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pokemons.map((pokemon, index) => (
          <div 
            key={`pokemon-${pokemon.id}`} 
            ref={index === pokemons.length - 1 ? lastPokemonRef : null}
          >
            <ClientPokemonCard 
              pokemon={pokemon} 
              showActions={true}
              showRating={true}
            />
          </div>
        ))}
      </div>
      
      {isDataLoading && (
        <div className="text-center my-6">
          <LoadingSpinner />
          <p className="mt-2 text-gray-400">Chargement des Pokémon...</p>
        </div>
      )}
      
      {pokemons.length > 0 && !isDataLoading && (
        <div className="text-center text-gray-400 my-8">
          {loadedIds.current.size} Pokémon chargés
        </div>
      )}
    </div>
  );
}