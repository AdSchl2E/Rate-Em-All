import { NextRequest, NextResponse } from 'next/server';
import { serverApiRequest } from '@/lib/api';

/**
 * GET - Batch Pokemon ratings route proxy to backend
 * Handles batch rating requests for multiple Pokemon IDs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json({ error: 'No Pokemon IDs provided' }, { status: 400 });
    }

    // Validate that IDs are comma-separated numbers
    const ids = idsParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No valid Pokemon IDs provided' }, { status: 400 });
    }

    // Make request to the backend API using serverApiRequest for consistency
    const data = await serverApiRequest('/pokemons/ratings/batch', {
      params: { ids: idsParam },
      cache: 'no-store' // Ensure fresh data for ratings
    });

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Pokemon Ratings Batch] Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        fallback: {} // Return empty object as fallback for ratings
      },
      { status: 500 }
    );
  }
}
