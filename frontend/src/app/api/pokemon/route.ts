import { NextRequest, NextResponse } from 'next/server';
import { serverApi } from '@/lib/api';

/**
 * GET - Simplified Pokemon route proxy to backend
 * All logic is now handled by the unified API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'list';
    
    // Convert searchParams to a regular object for the API
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    switch (action) {
      case 'list': {
        const ids = searchParams.get('ids');
        if (ids) {
          const result = await serverApi.pokemon.getByIds(ids.split(',').map(Number));
          return NextResponse.json({ pokemons: result });
        }
        
        const page = parseInt(searchParams.get('page') || '0');
        const limit = parseInt(searchParams.get('limit') || '20');
        const result = await serverApi.pokemon.getList({ page, limit });
        return NextResponse.json(result);
      }
      
      case 'alternate-forms': {
        const limit = parseInt(searchParams.get('limit') || '1000');
        const offset = parseInt(searchParams.get('offset') || '898');
        const result = await serverApi.pokemon.getAlternateForms({ limit, offset });
        return NextResponse.json({ pokemons: result });
      }
      
      case 'top-rated': {
        const result = await serverApi.pokemon.getTopRated();
        return NextResponse.json(result);
      }
      
      case 'trending': {
        const result = await serverApi.pokemon.getTrending();
        return NextResponse.json(result);
      }
      
      case 'search': {
        const query = searchParams.get('q');
        if (!query) {
          return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }
        const result = await serverApi.pokemon.search(query);
        return NextResponse.json({ pokemons: result });
      }
      
      case 'count': {
        const result = await serverApi.pokemon.getCount();
        return NextResponse.json({ count: result });
      }
      
      case 'metadata': {
        const limit = parseInt(searchParams.get('limit') || '1500');
        const result = await serverApi.pokemon.getAllMetadata(limit);
        return NextResponse.json(result);
      }
      
      case 'batch': {
        const ids = searchParams.get('ids');
        if (!ids) {
          return NextResponse.json({ error: 'No Pokemon IDs provided' }, { status: 400 });
        }
        const result = await serverApi.pokemon.getByIds(ids.split(',').map(Number));
        return NextResponse.json(result);
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Pokemon Route] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}