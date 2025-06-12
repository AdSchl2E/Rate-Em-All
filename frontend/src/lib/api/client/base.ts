import { getSession } from 'next-auth/react';
import type { ApiOptions } from '../shared/types';

/**
 * Client-side API request function - use in Client Components only ('use client')
 */
export async function clientApiRequest<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  try {
    const {
      method = 'GET',
      body,
      params = {},
      headers = {},
      requiresAuth = false,
      noCache = false
    } = options;

    // Build URL with query parameters
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

    // Add cache busting if needed
    if (noCache) {
      queryParams.append('_t', Date.now().toString());
    }

    const queryString = queryParams.toString();
    const url = `/api${path}${queryString ? `?${queryString}` : ''}`;

    // Prepare headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authentication if required - client-side method
    if (requiresAuth) {
      const session = await getSession();
      
      if (session?.accessToken) {
        requestHeaders['Authorization'] = `Bearer ${session.accessToken}`;
      } else {
        console.warn('Auth required but no token available');
      }
    }

    // Configure request
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Control caching - client method
    requestOptions.cache = noCache ? 'no-store' : 'default';

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
      
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    console.error('[Client API] Request error:', error);
    throw error;
  }
}