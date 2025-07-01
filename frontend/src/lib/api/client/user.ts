import { clientApiRequest } from './base';
import type { UserRatingsResponse } from '../shared/types';

/**
 * Client-side user API utilities
 * For use in client components only ('use client')
 */
export const clientUser = {
  /**
   * Update user profile
   * 
   * @param username - New username to set for the user
   * @returns Response with updated user data
   */
  async updateProfile(username: string): Promise<{ success: boolean; user: any }> {
    return clientApiRequest('/users', {
      method: 'POST',
      body: { username },
      params: { action: 'update-profile' },
      requiresAuth: true
    });
  },
  
  /**
   * Check if username is available
   * 
   * @param username - Username to check availability for
   * @returns Object indicating if the username is available
   */
  async checkUsername(username: string): Promise<{ available: boolean }> {
    return clientApiRequest('/users', {
      params: { action: 'check-username', username },
      requiresAuth: true,
      noCache: true
    });
  },
  
  /**
   * Change user password
   * 
   * @param currentPassword - User's current password for verification
   * @param newPassword - New password to set
   * @returns Success status
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return clientApiRequest('/users', {
      method: 'POST',
      body: { currentPassword, newPassword },
      params: { action: 'change-password' },
      requiresAuth: true
    });
  },
  
  /**
   * Delete user account
   * 
   * @returns Success status
   */
  async deleteAccount(): Promise<{ success: boolean }> {
    return clientApiRequest('/users', {
      method: 'DELETE',
      requiresAuth: true
    });
  },
  
  /**
   * Get user's Pokemon ratings
   * 
   * @param userId - Optional user ID (defaults to current user)
   * @returns User's ratings for various Pokemon
   */
  async getUserRatings(userId?: string | number): Promise<UserRatingsResponse> {
    const id = userId || 'me';
    
    return clientApiRequest(`/users/${id}/pokemon`, {
      params: { action: 'ratings' },
      requiresAuth: true,
      noCache: true
    });
  },
  
  /**
   * Get user's favorite Pokemon
   * 
   * @param userId - Optional user ID (defaults to current user)
   * @returns Array of Pokemon IDs that the user has favorited
   */
  async getUserFavorites(userId?: string | number): Promise<{ favorites: number[] }> {
    const id = userId || 'me';
    
    return clientApiRequest(`/users/${id}/pokemon`, {
      params: { action: 'favorites' },
      requiresAuth: true,
      noCache: true
    });
  },
  
  /**
   * Rate a Pokemon
   * 
   * @param pokemonId - Pokedex ID of the Pokemon to rate
   * @param rating - Rating value (typically 0-5)
   * @param userId - Optional user ID (defaults to current user)
   * @returns Updated rating statistics
   */
  async ratePokemon(
    pokemonId: number, 
    rating: number, 
    userId?: string | number
  ): Promise<{ updatedRating: number; numberOfVotes: number }> {
    const id = userId || 'me';
    
    return clientApiRequest(`/users/${id}/pokemon`, {
      method: 'POST',
      body: { rating },
      params: { action: 'rate', pokedexId: pokemonId },
      requiresAuth: true
    });
  },
  
  /**
   * Toggle Pokemon favorite status
   * 
   * @param pokemonId - Pokedex ID of the Pokemon to toggle favorite status for
   * @param userId - Optional user ID (defaults to current user)
   * @returns Updated favorite status
   */
  async toggleFavorite(
    pokemonId: number, 
    userId?: string | number
  ): Promise<{ isFavorite: boolean }> {
    const id = userId || 'me';
    
    return clientApiRequest(`/users/${id}/pokemon`, {
      method: 'POST',
      params: { action: 'favorite', pokedexId: pokemonId },
      requiresAuth: true
    });
  }
};