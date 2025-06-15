/**
 * Retourne une classe Tailwind CSS pour colorer un élément en fonction d'une notation
 */
export function getRatingColor(rating: number): string {
  if (rating < 1) return 'text-gray-400';
  if (rating < 2) return 'text-yellow-400';
  if (rating < 3) return 'text-yellow-500';
  if (rating < 3.5) return 'text-amber-500';
  if (rating < 4) return 'text-amber-600';
  if (rating < 4.5) return 'text-orange-500';
  if (rating < 5) return 'text-orange-600';
  return 'text-red-500'; // Pour 5 exactement
}

/**
 * Retourne une classe de couleur de fond Tailwind CSS pour une notation
 */
export function getRatingBgColor(rating: number): string {
  if (rating < 1) return 'bg-gray-700';
  if (rating < 2) return 'bg-yellow-700';
  if (rating < 3) return 'bg-yellow-600';
  if (rating < 3.5) return 'bg-amber-600';
  if (rating < 4) return 'bg-amber-500';
  if (rating < 4.5) return 'bg-orange-500';
  if (rating < 5) return 'bg-orange-600';
  return 'bg-red-600';
}