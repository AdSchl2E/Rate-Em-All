import { serverApiRequest } from './base';
import type { AuthResponse, RegisterUserData } from '../shared/types';
import { API_CONFIG } from '../shared/config';

export const serverAuth = {
  /**
   * Get user data from server - used in RSC (React Server Components)
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
   */
  async register(userData: RegisterUserData): Promise<AuthResponse> {
    return serverApiRequest(API_CONFIG.endpoints.auth.signup, {
      method: 'POST',
      body: userData
    });
  }
};