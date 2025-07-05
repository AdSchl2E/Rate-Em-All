import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { serverApiRequest } from '@/lib/api/api';

// Get current user profile
export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
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
      { error: "Could not retrieve user profile" },
      { status: 500 }
    );
  }
}

// Update user profile or change password
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const action = request.nextUrl.searchParams.get('action');
    const body = await request.json();
    
    switch (action) {
      case 'update-profile': {
        const { username } = body;
        
        if (!username || username.trim() === '') {
          return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }
        
        const response = await serverApiRequest(`/user/${session.user.id}`, {
          method: 'PATCH',
          body: { pseudo: username },
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });
        
        return NextResponse.json({ success: true, user: response });
      }
      
      case 'change-password': {
        const { currentPassword, newPassword } = body;
        
        if (!currentPassword || !newPassword) {
          return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        
        if (newPassword.length < 8) {
          return NextResponse.json({ 
            error: 'New password must be at least 8 characters long' 
          }, { status: 400 });
        }
        
        const userId = session.user.id ? parseInt(session.user.id) : null;
        
        if (!userId) {
          return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }
        
        await serverApiRequest(`/user/${userId}/change-password`, {
          method: 'POST',
          body: { currentPassword, newPassword },
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });
        
        return NextResponse.json({ success: true });
      }
      
      case 'check-username': {
        const username = request.nextUrl.searchParams.get('username');
        
        if (!username) {
          return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }
        
        const userId = session.user.id ? parseInt(session.user.id) : null;
        
        if (!userId) {
          return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }
        
        const response = await serverApiRequest(`/user/check-username`, {
          method: 'GET',
          params: { username, userId: userId.toString() },
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });
        
        return NextResponse.json({ available: response.available });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Users Route] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete user account
export async function DELETE(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await serverApiRequest(`/user/${session.user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Users Route] Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete account' },
      { status: 500 }
    );
  }
}
