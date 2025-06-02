// Couleurs correspondantes à chaque type de Pokémon
export const typeColors: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

// Faiblesses et résistances de chaque type
export const typeEffectiveness: Record<string, { weakTo: string[], resistantTo: string[], immuneTo: string[] }> = {
  normal: {
    weakTo: ['fighting'],
    resistantTo: [],
    immuneTo: ['ghost'],
  },
  fire: {
    weakTo: ['water', 'ground', 'rock'],
    resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
    immuneTo: [],
  },
  // Ajouter les autres types...
};

// Fonction pour obtenir les faiblesses d'un Pokémon multi-types
export function getPokemonWeaknesses(types: string[]): string[] {
  if (!types || types.length === 0) return [];
  
  // Logic to calculate combined weaknesses based on multiple types
  // Implementation omitted for brevity
  return [];
}