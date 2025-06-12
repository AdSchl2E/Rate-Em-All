import { clientApiRequest } from './base';
import type { AuthResponse, RegisterUserData } from '../shared/types';

export const clientAuth = {
  /**
   * Register a new user
   */
  async register(userData: RegisterUserData): Promise<AuthResponse> {
    return clientApiRequest('/auth/signup', {
      method: 'POST',
      body: userData
    });
  },
  
  /**
   * Get current user profile
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