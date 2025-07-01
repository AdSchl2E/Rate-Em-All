import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { serverApiRequest } from '@/lib/api/server/base';

/**
 * GET - Retrieves details for a specific user
 * @param request - The incoming request object
 * @param params - Route parameters containing the userId
 * @returns User data or error response
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Use serverApiRequest instead of callBackend for better consistency
        const userData = await serverApiRequest(`/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            },
            cache: 'no-store'
        });

        return NextResponse.json(userData);
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return NextResponse.json(
            { error: "Unable to retrieve user information" },
            { status: 500 }
        );
    }
}

/**
 * PATCH - Updates information for a specific user
 * @param request - The incoming request object containing update data
 * @param params - Route parameters containing the userId
 * @returns Updated user data or error response
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate data
        const validFields = ['name', 'pseudo', 'email'];
        const updateData: Record<string, any> = {};

        Object.keys(body).forEach(key => {
            if (validFields.includes(key)) {
                updateData[key] = body[key];
            }
        });

        // If no valid fields are provided
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No valid data provided for update" },
                { status: 400 }
            );
        }

        // Call backend API
        const updatedUser = await serverApiRequest(`/user/${userId}`, {
            method: 'PATCH',
            body: updateData,
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        });

        return NextResponse.json({
            success: true,
            user: updatedUser
        });
    } catch (error: any) {
        console.error(`Error updating user ${userId}:`, error);
        return NextResponse.json(
            { error: error.message || "Unable to update user" },
            { status: 500 }
        );
    }
}

/**
 * DELETE - Deletes a user account
 * @param request - The incoming request object
 * @param params - Route parameters containing the userId
 * @returns Success message or error response
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Call backend API
        await serverApiRequest(`/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        });

        return NextResponse.json({
            success: true,
            message: "User account successfully deleted"
        });
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        return NextResponse.json(
            { error: "Unable to delete user account" },
            { status: 500 }
        );
    }
}