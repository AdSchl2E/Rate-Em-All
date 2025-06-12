import { serverApiRequest } from './base';
import { API_CONFIG } from '../shared/config';
import type { UserRatingsResponse } from '../shared/types';

export const serverUser = {
  /**
   * Get user profile - server-side
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