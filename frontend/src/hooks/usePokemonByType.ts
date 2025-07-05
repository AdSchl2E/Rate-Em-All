import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface UsePokemonByTypeOptions {
  /** The type to filter by */
  type?: string;
  /** Maximum number of Pokemon to fetch */
  limit?: number;
  /** Whether to fetch immediately */
  enabled?: boolean;
}

interface UsePokemonByTypeReturn {
  /** Pokemon data */
  pokemon: any[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Refetch function */
  refetch: () => void;
}

/**
 * Hook to fetch Pokemon by type using PokeAPI
 * 
 * @param options - Configuration options
 * @returns Pokemon data, loading state, error state, and refetch function
 */
export function usePokemonByType({
  type,
  limit = 12,
  enabled = true
}: UsePokemonByTypeOptions): UsePokemonByTypeReturn {
  const [pokemon, setPokemon] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemon = async () => {
    if (!type || !enabled) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await api.pokemon.getByType(type, limit);
      setPokemon(result);
    } catch (err) {
      console.error('Error fetching Pokemon by type:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, [type, limit, enabled]);

  return {
    pokemon,
    loading,
    error,
    refetch: fetchPokemon
  };
}
