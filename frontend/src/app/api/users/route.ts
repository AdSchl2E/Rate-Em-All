import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { serverApiRequest } from '@/lib/api';

/**
 * GET - Get current user information
 * Simplified proxy to backend API
 */
export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: NextRequest
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions) as any;

    if (!session?.user || !session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized', requiresLogin: true }, { status: 401 });
    }

    // Get user profile from backend
    const userData = await serverApiRequest('/user/me', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error('[Users Route] GET error:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({ error: 'Session expired', requiresLogin: true }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Unable to retrieve user information' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new user (signup) or handle user actions
 * Simplified proxy to backend API
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    if (action === 'change-password') {
      // Handle password change
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = await getServerSession(authOptions) as any;

      if (!session?.user || !session?.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
      }

      await serverApiRequest(`/user/${session.user.id}/change-password`, {
        method: 'POST',
        body: { currentPassword, newPassword },
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });

      return NextResponse.json({ success: true });
    } else {
      // Handle signup
      const body = await request.json();
      
      const newUser = await serverApiRequest('/auth/signup', {
        method: 'POST',
        body
      });

      return NextResponse.json({
        success: true,
        user: newUser
      });
    }
  } catch (error) {
    console.error('[Users Route] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to process request' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update current user information
 * Simplified proxy to backend API
 */
export async function PATCH(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions) as any;

    if (!session?.user || !session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const updatedUser = await serverApiRequest('/user/me', {
      method: 'PATCH',
      body,
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('[Users Route] PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update user' },
      { status: 500 }
    );
  }
}
