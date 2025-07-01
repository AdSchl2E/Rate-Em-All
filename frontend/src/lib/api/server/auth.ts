import { serverApiRequest } from './base';
import type { AuthResponse, RegisterUserData } from '../shared/types';
import { API_CONFIG } from '../shared/config';

/**
 * Server-side authentication utilities for use in React Server Components
 */
export const serverAuth = {
  /**
   * Get user data from server - used in RSC (React Server Components)
   * 
   * @param authToken - Optional authentication token
   * @returns User session data or null if unauthorized
   */
  async getServerSession(authToken?: string): Promise<AuthResponse | null> {
    if (!authToken) {
      return null;
    }

    try {
      return await serverApiRequest('/auth/session', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.error('[Server Auth] Session verification failed:', error);
      return null;
    }
  },
  
  /**
   * Register a new user - server-side
   * 
   * @param userData - User registration data including username, email and password
   * @returns Authentication response with token and user information
   */
  async register(userData: RegisterUserData): Promise<AuthResponse> {
    return serverApiRequest(API_CONFIG.endpoints.auth.signup, {
      method: 'POST',
      body: userData
    });
  }
};