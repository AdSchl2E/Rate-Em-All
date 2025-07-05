import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { serverApiRequest } from '@/lib/api/api';

/**
 * GET - Get user Pokemon data (ratings or favorites)
 * Simplified proxy to backend API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'ratings';
    
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    switch (action) {
      case 'ratings': {
        const response = await serverApiRequest(`/user/${userId}/ratings`, {
          headers: { 'Authorization': `Bearer ${session.accessToken}` },
          cache: 'no-store'
        });
        
        return NextResponse.json(response);
      }
      
      case 'favorites': {
        const response = await serverApiRequest(`/user/${userId}/favorite-pokemon`, {
          headers: { 'Authorization': `Bearer ${session.accessToken}` },
          cache: 'no-store'
        });
        
        return NextResponse.json({ 
          favorites: response?.favorites || [] 
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[User Pokemon Route] GET error:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({ error: 'Session expired', requiresLogin: true }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Unable to retrieve Pokemon data' },
      { status: 500 }
    );
  }
}

/**
 * POST - Rate Pokemon or toggle favorite
 * Simplified proxy to backend API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const pokedexId = searchParams.get('pokedexId');
    const action = searchParams.get('action') || '';
    
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!pokedexId) {
      return NextResponse.json({ error: 'Missing pokedexId parameter' }, { status: 400 });
    }
    
    switch (action) {
      case 'rate': {
        const body = await request.json();
        const { rating } = body;
        
        if (rating === undefined) {
          return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
        }
        
        const response = await serverApiRequest(`/user/${userId}/rate-pokemon/${pokedexId}`, {
          method: 'POST',
          body: { rating },
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });
        
        return NextResponse.json(response);
      }
      
      case 'favorite':
      case 'toggle-favorite': {
        const response = await serverApiRequest(`/user/${userId}/favorite-pokemon/${pokedexId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });
        
        return NextResponse.json(response);
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[User Pokemon Route] POST error:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({ error: 'Session expired', requiresLogin: true }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Unable to perform action' },
      { status: 500 }
    );
  }
}