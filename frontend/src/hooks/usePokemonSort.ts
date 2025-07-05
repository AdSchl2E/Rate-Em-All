import { useMemo, useCallback, useState } from 'react';
import { Pokemon } from '@/types/pokemon';

/**
 * Sort criteria for Pokemon
 */
export type PokemonSortField = 
  | 'id' 
  | 'name' 
  | 'rating' 
  | 'numberOfVotes' 
  | 'userRating' 
  | 'communityRating'
  | 'votes';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Configuration for sort field
 */
interface SortFieldConfig {
  /** Default sort direction for this field */
  defaultDirection: SortDirection;
  /** Whether this is a numeric field */
  isNumeric: boolean;
}

/**
 * Configuration for each sort field
 */
const SORT_FIELD_CONFIG: Record<PokemonSortField, SortFieldConfig> = {
  id: { defaultDirection: 'asc', isNumeric: true },
  name: { defaultDirection: 'asc', isNumeric: false },
  rating: { defaultDirection: 'desc', isNumeric: true },
  numberOfVotes: { defaultDirection: 'desc', isNumeric: true },
  userRating: { defaultDirection: 'desc', isNumeric: true },
  communityRating: { defaultDirection: 'desc', isNumeric: true },
  votes: { defaultDirection: 'desc', isNumeric: true },
};

/**
 * Props for usePokemonSort hook
 */
interface UsePokemonSortProps {
  /** Pokemon list to sort */
  pokemons: Pokemon[];
  /** Current sort field */
  sortField: PokemonSortField;
  /** Current sort direction */
  sortDirection: SortDirection;
  /** User ratings lookup (optional) */
  userRatings?: Record<number, number>;
  /** Pokemon cache lookup (optional) */
  pokemonCache?: Record<number, Pokemon>;
}

/**
 * Universal Pokemon sorting hook
 * 
 * Provides consistent sorting logic for Pokemon across the application.
 * Handles different sort fields with appropriate default directions.
 * 
 * @param props Hook configuration
 * @returns Sorted Pokemon array
 */
export function usePokemonSort({
  pokemons,
  sortField,
  sortDirection,
  userRatings = {},
  pokemonCache = {}
}: UsePokemonSortProps): Pokemon[] {
  return useMemo(() => {
    return [...pokemons].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
          
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
          
        case 'rating':
        case 'communityRating':
          // Use cache if available, fallback to original value
          const ratingA = pokemonCache[a.id]?.rating ?? a.rating ?? 0;
          const ratingB = pokemonCache[b.id]?.rating ?? b.rating ?? 0;
          comparison = ratingA - ratingB;
          break;
          
        case 'numberOfVotes':
        case 'votes':
          // Use cache if available, fallback to original value
          const votesA = pokemonCache[a.id]?.numberOfVotes ?? a.numberOfVotes ?? 0;
          const votesB = pokemonCache[b.id]?.numberOfVotes ?? b.numberOfVotes ?? 0;
          comparison = votesA - votesB;
          break;
          
        case 'userRating':
          const userRatingA = userRatings[a.id] ?? 0;
          const userRatingB = userRatings[b.id] ?? 0;
          comparison = userRatingA - userRatingB;
          break;
          
        default:
          return 0;
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [pokemons, sortField, sortDirection, userRatings, pokemonCache]);
}

/**
 * Hook for managing sort state with smart defaults
 * 
 * @param initialField Initial sort field
 * @returns Sort state and handlers
 */
export function usePokemonSortState(initialField: PokemonSortField = 'id') {
  const [sortField, setSortField] = useState<PokemonSortField>(initialField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SORT_FIELD_CONFIG[initialField].defaultDirection
  );

  /**
   * Handle sort field change with intelligent direction setting
   */
  const handleSortChange = useCallback((newField: PokemonSortField) => {
    if (newField === sortField) {
      // Toggle direction if same field
      setSortDirection((prev: SortDirection) => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field: use default direction
      setSortField(newField);
      setSortDirection(SORT_FIELD_CONFIG[newField].defaultDirection);
    }
  }, [sortField]);

  /**
   * Reset to default sort
   */
  const resetSort = useCallback(() => {
    setSortField('id');
    setSortDirection('asc');
  }, []);

  return {
    sortField,
    sortDirection,
    handleSortChange,
    resetSort,
    setSortField,
    setSortDirection
  };
}

/**
 * Get the default sort direction for a field
 */
export function getDefaultSortDirection(field: PokemonSortField): SortDirection {
  return SORT_FIELD_CONFIG[field].defaultDirection;
}

/**
 * Check if a field is numeric
 */
export function isNumericSortField(field: PokemonSortField): boolean {
  return SORT_FIELD_CONFIG[field].isNumeric;
}
