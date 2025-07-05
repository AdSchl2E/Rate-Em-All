import { useMemo } from 'react';
import { Pokemon } from '@/types/pokemon';

/**
 * Generation configuration
 */
export interface Generation {
  /** Generation index (0-based) */
  index: number;
  /** Display name */
  name: string;
  /** Generation identifier (e.g., "generation-i") */
  id: string;
  /** Pokemon ID ranges for this generation */
  range: {
    start: number;
    end: number;
  };
}

/**
 * All Pokemon generations
 */
export const POKEMON_GENERATIONS: Generation[] = [
  { index: 0, name: 'Generation I', id: 'generation-i', range: { start: 1, end: 151 } },
  { index: 1, name: 'Generation II', id: 'generation-ii', range: { start: 152, end: 251 } },
  { index: 2, name: 'Generation III', id: 'generation-iii', range: { start: 252, end: 386 } },
  { index: 3, name: 'Generation IV', id: 'generation-iv', range: { start: 387, end: 493 } },
  { index: 4, name: 'Generation V', id: 'generation-v', range: { start: 494, end: 649 } },
  { index: 5, name: 'Generation VI', id: 'generation-vi', range: { start: 650, end: 721 } },
  { index: 6, name: 'Generation VII', id: 'generation-vii', range: { start: 722, end: 809 } },
  { index: 7, name: 'Generation VIII', id: 'generation-viii', range: { start: 810, end: 905 } },
  { index: 8, name: 'Generation IX', id: 'generation-ix', range: { start: 906, end: 1025 } },
];

/**
 * Get generation for a Pokemon ID
 */
export function getPokemonGeneration(pokemonId: number): Generation | null {
  return POKEMON_GENERATIONS.find(gen => 
    pokemonId >= gen.range.start && pokemonId <= gen.range.end
  ) || null;
}

/**
 * Get generation from Pokemon species info
 */
export function getPokemonGenerationFromSpecies(pokemon: Pokemon): Generation | null {
  // First try using species_info if available
  if (pokemon.species_info?.generation?.name) {
    const generationId = pokemon.species_info.generation.name;
    const generation = POKEMON_GENERATIONS.find(gen => gen.id === generationId);
    if (generation) {
      return generation;
    }
  }
  
  // Fallback to ID-based lookup
  return getPokemonGeneration(pokemon.id);
}

/**
 * Props for usePokemonGenerationFilter hook
 */
interface UsePokemonGenerationFilterProps {
  /** Pokemon list to filter */
  pokemons: Pokemon[];
  /** Selected generation index (null = no filter) */
  selectedGeneration: number | null;
}

/**
 * Hook for filtering Pokemon by generation
 * 
 * @param props Filter configuration
 * @returns Filtered Pokemon array
 */
export function usePokemonGenerationFilter({
  pokemons,
  selectedGeneration
}: UsePokemonGenerationFilterProps): Pokemon[] {
  return useMemo(() => {
    if (selectedGeneration === null) {
      return pokemons;
    }
    
    const targetGeneration = POKEMON_GENERATIONS[selectedGeneration];
    if (!targetGeneration) {
      return pokemons;
    }
    
    return pokemons.filter(pokemon => {
      const generation = getPokemonGenerationFromSpecies(pokemon);
      return generation?.index === selectedGeneration;
    });
  }, [pokemons, selectedGeneration]);
}

/**
 * Get all unique generations from a Pokemon list
 */
export function getAvailableGenerations(pokemons: Pokemon[]): Generation[] {
  const generationIndices = new Set<number>();
  
  pokemons.forEach(pokemon => {
    const generation = getPokemonGenerationFromSpecies(pokemon);
    if (generation) {
      generationIndices.add(generation.index);
    }
  });
  
  return Array.from(generationIndices)
    .sort()
    .map(index => POKEMON_GENERATIONS[index])
    .filter(Boolean);
}
