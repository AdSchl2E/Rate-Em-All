import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { serverApiRequest } from '@/lib/api/api';

/**
 * GET - Get user by ID
 * Simplified proxy to backend API
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userData = await serverApiRequest(`/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            },
            cache: 'no-store'
        });

        return NextResponse.json(userData);
    } catch (error) {
        console.error('[User ID Route] GET error:', error);
        return NextResponse.json(
            { error: 'Unable to retrieve user information' },
            { status: 500 }
        );
    }
}

/**
 * PATCH - Update user information
 * Simplified proxy to backend API
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const updatedUser = await serverApiRequest(`/user/${userId}`, {
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
        console.error('[User ID Route] PATCH error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unable to update user' },
            { status: 500 }
        );
    }
}

/**
 * DELETE - Delete user account
 * Simplified proxy to backend API
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await serverApiRequest(`/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        });

        return NextResponse.json({
            success: true,
            message: 'User account successfully deleted'
        });
    } catch (error) {
        console.error('[User ID Route] DELETE error:', error);
        return NextResponse.json(
            { error: 'Unable to delete user account' },
            { status: 500 }
        );
    }
}