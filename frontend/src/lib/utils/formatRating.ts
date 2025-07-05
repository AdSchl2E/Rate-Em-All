/**
 * Utility functions for formatting ratings and scores
 */

/**
 * Format a rating value to 2 decimal places
 * @param rating - The rating value to format
 * @param fallback - The fallback value if rating is 0 or undefined
 * @returns Formatted rating string
 */
export function formatRating(rating: number | undefined | null, fallback = '0.00'): string {
  if (!rating || rating === 0) {
    return fallback;
  }
  return rating.toFixed(2);
}

/**
 * Format a user rating (usually integers) to display consistently
 * @param rating - The user rating value
 * @returns Formatted rating string
 */
export function formatUserRating(rating: number | undefined | null): string {
  if (!rating || rating === 0) {
    return '0';
  }
  // User ratings are typically integers, but we can format them consistently
  return rating.toString();
}

/**
 * Format a percentage value
 * @param value - The percentage value (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return value.toFixed(1) + '%';
}

/**
 * Get a color class based on rating value
 * @param rating - The rating value (0-5)
 * @returns CSS color class name
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-400';
  if (rating >= 4.0) return 'text-green-300';
  if (rating >= 3.5) return 'text-yellow-400';
  if (rating >= 3.0) return 'text-yellow-300';
  if (rating >= 2.0) return 'text-orange-400';
  if (rating >= 1.0) return 'text-red-400';
  return 'text-gray-400';
}
