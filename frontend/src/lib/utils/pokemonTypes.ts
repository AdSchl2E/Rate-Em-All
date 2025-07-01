/**
 * Color mappings for each Pokemon type
 * Used for UI elements like type badges and backgrounds
 */
export const typeColors: { [key: string]: string } = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

/**
 * Get primary and secondary colors for a Pokemon based on its types
 * @param pokemon - Pokemon object containing type information
 * @returns Array with primary and secondary colors as hex values
 */
export function getPokemonTypeColors(pokemon: any) {
  if (!pokemon?.types || pokemon.types.length === 0) {
    return ['#6B7280', '#4B5563']; // Default gray
  }

  const primaryType = pokemon.types[0].type.name;
  const primaryColor = typeColors[primaryType] || '#6B7280';
  
  if (pokemon.types.length === 1) {
    // If only one type, use a slightly darker shade for secondary color
    return [primaryColor, darkenColor(primaryColor, 10)];
  }

  const secondaryType = pokemon.types[1].type.name;
  const secondaryColor = typeColors[secondaryType] || '#4B5563';
  
  return [primaryColor, secondaryColor];
}

/**
 * Darken a hex color by a given percentage
 * @param hex - Hex color code (e.g. "#FF0000")
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color
 */
function darkenColor(hex: string, percent: number): string {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Darken each component
  r = Math.max(0, Math.floor(r * (100 - percent) / 100));
  g = Math.max(0, Math.floor(g * (100 - percent) / 100));
  b = Math.max(0, Math.floor(b * (100 - percent) / 100));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}