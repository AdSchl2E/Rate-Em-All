import { serverApiRequest } from './base';
import { API_CONFIG } from '../shared/config';
import type { UserRatingsResponse } from '../shared/types';

/**
 * Server-side user API utilities
 * For use in React Server Components only
 */
export const serverUser = {
  /**
   * Get user profile - server-side
   * 
   * @param userId - Optional user ID (defaults to 'me' for current user)
   * @param token - Optional authentication token
   * @returns User profile data
   */
  async getProfile(userId?: number | string, token?: string): Promise<any> {
    const id = userId || 'me';
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return serverApiRequest(API_CONFIG.endpoints.user.profile(id), {
      headers,
      requiresAuth: !token
    });
  },
  
  /**
   * Get user's Pokemon ratings - server-side
   * 
   * @param userId - User ID to fetch ratings for
   * @param token - Optional authentication token
   * @returns Object containing user's Pokemon ratings
   */
  async getUserRatings(userId: number | string, token?: string): Promise<UserRatingsResponse> {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return serverApiRequest(API_CONFIG.endpoints.user.ratings(userId), {
      headers,
      requiresAuth: !token,
      cache: 'no-store'
    });
  },
  
  /**
   * Get user's favorite Pokemon - server-side
   * 
   * @param userId - User ID to fetch favorites for
   * @param token - Optional authentication token
   * @returns Object containing array of favorite Pokemon IDs
   */
  async getUserFavorites(userId: number | string, token?: string): Promise<{ favorites: number[] }> {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return serverApiRequest(API_CONFIG.endpoints.user.favorites(userId), {
      headers,
      requiresAuth: !token,
      cache: 'no-store'
    });
  }
};