import { clientApiRequest } from './base';
import type { UserRatingsResponse } from '../shared/types';

export const clientUser = {
  /**
   * Update user profile
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
   */
  async deleteAccount(): Promise<{ success: boolean }> {
    return clientApiRequest('/users', {
      method: 'DELETE',
      requiresAuth: true
    });
  },
  
  /**
   * Get user's Pokemon ratings
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