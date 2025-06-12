import { typeColors } from '@/lib/utils/pokemonTypes';

interface PokemonTypeTagProps {
  type: string;
  className?: string;
}

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