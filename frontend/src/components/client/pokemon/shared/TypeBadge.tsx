import { typeColors } from '@/lib/utils/pokemonTypes';

type TypeBadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface TypeBadgeProps {
  type: string;
  className?: string;
  size?: TypeBadgeSize;
}

export default function TypeBadge({ 
  type, 
  className = "",
  size = "md"
}: TypeBadgeProps) {
  // Size variants
  const sizeClasses: Record<TypeBadgeSize, string> = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <span
      className={`badge font-medium text-white ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: typeColors[type] || '#999999' }}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}