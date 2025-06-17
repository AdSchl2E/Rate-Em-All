import { headers } from 'next/headers';
import { API_CONFIG } from '../shared/config';
import type { ApiOptions } from '../shared/types';

/**
 * Server-side API request function - use only in Server Components
 */
export async function serverApiRequest<T = any>(
  path: string, 
  options: ApiOptions = {}
): Promise<T> {
  try {
    const {
      method = 'GET',
      body,
      params = {},
      headers: customHeaders = {},
      requiresAuth = false,
      noCache = false,
      cache = 'no-store' // Default to no-store for server
    } = options;

    // Build query params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const queryString = queryParams.toString();
    
    // Server-side uses direct API URL, not /api routes
    const url = `${API_CONFIG.baseUrl}${path}${queryString ? `?${queryString}` : ''}`;

    // Prepare headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // For server components, get auth token from request headers if needed
    if (requiresAuth) {
      // IMPORTANT: This must be wrapped in a try-catch as it can throw if
      // called during static rendering or outside of a request context
      try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        if (authHeader) {
          requestHeaders['Authorization'] = authHeader;
        } else if (process.env.API_SECRET_KEY) {
          // Backend-to-backend communication can use a server secret
          requestHeaders['X-API-Key'] = process.env.API_SECRET_KEY;
        }
      } catch (error) {
        console.warn('[Server API] Could not access request headers:', error);
      }
    }

    // Configure request
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      next: { 
        // Use appropriate cache configuration based on options
        revalidate: noCache ? 0 : undefined
      },
      cache
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Make request
    const response = await fetch(url, requestOptions);
    
    // Handle different content types
    let data;
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      const errorMessage = 
        (typeof data === 'object' && data?.message) ? data.message :
        (typeof data === 'object' && data?.error) ? data.error :
        (typeof data === 'string') ? data : 
        `API Error ${response.status}`;
      
      console.error(`[Server API Error] ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    console.error('[Server API] Request error:', error);
    throw error;
  }
}

/**
 * Call PokeAPI directly from server component
 */
export async function serverPokeApiRequest<T = any>(
  path: string,
  cacheTime = 86400 // 1 day default cache
): Promise<T> {
  try {
    const url = `https://pokeapi.co/api/v2${path}`;
    
    const response = await fetch(url, {
      next: { revalidate: cacheTime }
    });
    
    if (!response.ok) {
      return Promise.reject(new Error(`PokeAPI request failed: ${response.status} ${response.statusText}`));
    }
    
    return await response.json();
  } catch (error) {
    console.error('[PokeAPI] Error:', error);
    throw error;
  }
}