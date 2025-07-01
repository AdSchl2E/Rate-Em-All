import { clientApiRequest } from './base';
import type { AuthResponse, RegisterUserData } from '../shared/types';

/**
 * Client-side authentication API utilities
 * For use in client components only ('use client')
 */
export const clientAuth = {
  /**
   * Register a new user
   * 
   * @param userData - User registration data including username, email and password
   * @returns Authentication response with token and user information
   */
  async register(userData: RegisterUserData): Promise<AuthResponse> {
    return clientApiRequest('/auth/signup', {
      method: 'POST',
      body: userData
    });
  },
  
  /**
   * Get current user profile
   * 
   * @param token - Optional authentication token
   * @returns Current user profile data
   */
  async getProfile(token?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return clientApiRequest('/users', {
      headers,
      requiresAuth: !token,
      noCache: true
    });
  }
};