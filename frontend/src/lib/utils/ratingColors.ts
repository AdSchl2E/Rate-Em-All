/**
 * Get text color class based on rating value
 * @param rating - Rating value (0-5)
 * @returns Tailwind text color class
 */
export const getRatingColor = (rating: number): string => {
  if (rating < 1) return 'text-gray-400';
  if (rating < 2) return 'text-yellow-400';
  if (rating < 3) return 'text-yellow-500';
  if (rating < 3.5) return 'text-amber-500';
  if (rating < 4) return 'text-amber-600';
  if (rating < 4.5) return 'text-orange-500';
  if (rating < 5) return 'text-orange-600';
  return 'text-red-500'; // perfect score, gold red
};

/**
 * Get background color class based on rating value
 * @param rating - Rating value (0-5)
 * @returns Tailwind background color class
 */
export const getRatingBgColor = (rating: number): string => {
  if (rating < 1) return 'bg-gray-400';
  if (rating < 2) return 'bg-yellow-400';
  if (rating < 3) return 'bg-yellow-500';
  if (rating < 3.5) return 'bg-amber-500';
  if (rating < 4) return 'bg-amber-600';
  if (rating < 4.5) return 'bg-orange-500';
  if (rating < 5) return 'bg-orange-600';
  return 'bg-red-500'; // perfect score, gold red
};