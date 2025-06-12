import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { serverApiRequest } from '@/lib/api/server/base';


export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'ratings';
  
  // Obtenir la session pour l'authentification
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  
  try {
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
        
        // Ensure we return an array of favorites
        return NextResponse.json({ 
          favorites: response?.favorites || [] 
        });
      }
      
      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error fetching user ${userId} ${action}:`, error);
    return NextResponse.json(
      { error: `Impossible de récupérer les données ${action} de l'utilisateur` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const searchParams = request.nextUrl.searchParams;
  const pokedexId = searchParams.get('pokedexId');
  const action = searchParams.get('action') || '';
  
  // Obtenir la session pour l'authentification
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  
  if (!pokedexId) {
    return NextResponse.json({ error: 'Paramètre pokedexId manquant' }, { status: 400 });
  }
  
  try {
    switch (action) {
      case 'rate': {
        const body = await request.json();
        const { rating } = body;
        
        if (rating === undefined) {
          return NextResponse.json({ error: 'La note est requise' }, { status: 400 });
        }
        
        const response = await serverApiRequest(`/user/${userId}/rate-pokemon/${pokedexId}`, {
          method: 'POST',
          body: { rating },
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });
        
        return NextResponse.json(response);
      }
      
      case 'favorite': {
        const response = await serverApiRequest(`/user/${userId}/favorite-pokemon/${pokedexId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });
        
        return NextResponse.json(response);
      }
      
      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error performing ${action} for user ${userId} on Pokemon ${pokedexId}:`, error);
    return NextResponse.json(
      { error: `Impossible de réaliser l'action ${action}` },
      { status: 500 }
    );
  }
}