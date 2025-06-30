/**
 * Props interface for ServerStarRating component
 */
interface ServerStarRatingProps {
  /** Rating value (0-5) */
  value: number;
  /** Size variant for the stars */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ServerStarRating component
 * 
 * Server-side rendered star rating display.
 * Renders a set of stars based on the provided rating value.
 * 
 * @param props - Component props
 * @returns React component
 */
export function ServerStarRating({ value = 0, size = 'md' }: ServerStarRatingProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  // Convert rating to full and partial stars
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex ${sizeClasses[size]}`}>
      {/* Full stars */}
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={`full-${i}`} className="text-yellow-500">★</span>
      ))}
      
      {/* Half star (if applicable) */}
      {hasHalfStar && (
        <span className="text-yellow-500">★</span>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }, (_, i) => (
        <span key={`empty-${i}`} className="text-gray-400">★</span>
      ))}
    </div>
  );
}