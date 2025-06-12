import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { serverApiRequest } from '@/lib/api/server/base';

// Get current user profile
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  
  try {
    const userData = await serverApiRequest(`/user/me`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    });
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer le profil utilisateur" },
      { status: 500 }
    );
  }
}

// Update user profile
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  
  const action = request.nextUrl.searchParams.get('action');
  
  switch (action) {
    case 'update-profile': {
      const body = await request.json();
      const { username } = body;
      
      // Validate username
      if (!username || username.trim() === '') {
        return NextResponse.json({ error: 'Le pseudo est requis' }, { status: 400 });
      }
      
      const response = await serverApiRequest(`/user/${session.user.id}`, {
        method: 'PATCH',
        body: { name: username },
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });
      
      if (!response.error) {
        return NextResponse.json({ success: true, user: response.data });
      }
      
      return NextResponse.json({ error: response.error }, { status: response.status });
    }
    
    case 'change-password': {
      const body = await request.json();
      const { currentPassword, newPassword } = body;
      
      // Validate passwords
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
      }
      
      if (newPassword.length < 8) {
        return NextResponse.json({ 
          error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' 
        }, { status: 400 });
      }
      
      const userId = session.user.id ? parseInt(session.user.id) : null;
      
      if (!userId) {
        return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });
      }
      
      const response = await serverApiRequest(`/user/${userId}/change-password`, {
        method: 'POST',
        body: { currentPassword, newPassword },
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });
      
      if (!response.error) {
        return NextResponse.json({ success: true });
      }
      
      return NextResponse.json({ error: response.error }, { status: response.status });
    }
    
    case 'check-username': {
      const username = request.nextUrl.searchParams.get('username');
      
      if (!username) {
        return NextResponse.json({ error: 'Le pseudo est requis' }, { status: 400 });
      }
      
      const userId = session.user.id ? parseInt(session.user.id) : null;
      
      if (!userId) {
        return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });
      }
      
      const response = await serverApiRequest(`/user/check-username`, {
        method: 'GET',
        params: { username, userId: userId.toString() },
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });
      
      if (!response.error) {
        return NextResponse.json({ available: response.data.available });
      }
      
      return NextResponse.json({ error: response.error }, { status: response.status });
    }
    
    default:
      return NextResponse.json({ error: 'Action non valide' }, { status: 400 });
  }
}

// Delete user account
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  
  const response = await serverApiRequest(`/user/${session.user.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`
    }
  });
  
  if (!response.error) {
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: response.error }, { status: response.status });
}