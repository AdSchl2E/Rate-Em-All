import { typeColors } from '@/lib/utils/pokemonTypes';

/**
 * Props for the PokemonTypeTag component
 */
interface PokemonTypeTagProps {
  /** Pokémon type name (e.g., 'fire', 'water', etc.) */
  type: string;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * PokemonTypeTag component
 * 
 * Displays a Pokémon type as a colored badge.
 * Uses the corresponding type color from the typeColors utility.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function PokemonTypeTag({ type, className = "" }: PokemonTypeTagProps) {
  return (
    <span
      className={`badge text-white font-medium ${className}`}
      style={{ backgroundColor: typeColors[type] }}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}