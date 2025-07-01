import { API_CONFIG } from '@/lib/api/shared/config';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

/**
 * Standardized API response interface
 * @template T Type of data to be returned
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Make an authenticated request to the backend API
 * @template T Expected response data type
 * @param path API endpoint path
 * @param options Request options including method, body, headers, etc.
 * @returns Standardized API response
 */
export async function callBackend<T = any>(
  path: string, 
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    requireAuth?: boolean;
    cacheConfig?: any;
    params?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true,
      cacheConfig = { cache: 'no-store' },
      params = {}
    } = options;

    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    const url = `${API_CONFIG.baseUrl}${path}${queryString ? `?${queryString}` : ''}`;

    // Get auth token if required
    let authHeaders = {};
    if (requireAuth) {
      const session = await getServerSession(authOptions);
      
      if (!session?.accessToken) {
        return { error: 'Unauthorized', status: 401 };
      }
      
      authHeaders = {
        'Authorization': `Bearer ${session.accessToken}`
      };
    }
    
    // Make the request
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers
      },
      ...cacheConfig
    };
    
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }
    
    console.log(`[API] ${method} ${url}`);
    const response = await fetch(url, requestOptions);
    
    // Handle different response types
    const contentType = response.headers.get('Content-Type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data?.message 
        ? data.message 
        : typeof data === 'string' 
          ? data 
          : 'Unknown error';
          
      console.error(`[API] Error ${response.status}: ${errorMessage}`);
      return { error: errorMessage, status: response.status };
    }
    
    return { data, status: response.status };
  } catch (error) {
    console.error('[API] Unhandled error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: errorMessage, status: 500 };
  }
}

/**
 * Standard API response handler
 * @template T Type of data to be returned
 * @param apiResponse The response object from callBackend
 * @returns NextResponse with appropriate status and data
 */
export function createApiResponse<T>(apiResponse: ApiResponse<T>) {
  if (apiResponse.error) {
    return NextResponse.json(
      { error: apiResponse.error },
      { status: apiResponse.status }
    );
  }
  
  return NextResponse.json(apiResponse.data, { status: apiResponse.status });
}

/**
 * Extract token from request headers
 * @param request The incoming request object
 * @returns The authorization token or null if not found
 */
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}

/**
 * Call PokeAPI with standard error handling
 * @template T Expected response data type
 * @param path API endpoint path
 * @param cacheConfig Cache configuration
 * @returns Standardized API response
 */
export async function callPokeApi<T = any>(
  path: string,
  cacheConfig = API_CONFIG.cacheConfig.long
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2${path}`, {
      next: cacheConfig
    });
    
    if (!response.ok) {
      return {
        error: `PokeAPI error: ${response.status}`,
        status: response.status
      };
    }
    
    const data = await response.json();
    return { data, status: 200 };
  } catch (error) {
    console.error('[PokeAPI] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: errorMessage, status: 500 };
  }
}