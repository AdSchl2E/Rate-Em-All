import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { serverApiRequest } from '@/lib/api/server/base';

/**
 * GET - Récupère les détails d'un utilisateur spécifique
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est authentifié
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        // Utiliser serverApiRequest au lieu de callBackend pour une meilleure cohérence
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
            { error: "Impossible de récupérer les informations de l'utilisateur" },
            { status: 500 }
        );
    }
}

/**
 * PATCH - Met à jour les informations d'un utilisateur
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est authentifié
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validation des données
        const validFields = ['name', 'pseudo', 'email'];
        const updateData: Record<string, any> = {};

        Object.keys(body).forEach(key => {
            if (validFields.includes(key)) {
                updateData[key] = body[key];
            }
        });

        // Si aucun champ valide n'est fourni
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "Aucune donnée valide fournie pour la mise à jour" },
                { status: 400 }
            );
        }

        // Appeler l'API backend
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
            { error: error.message || "Impossible de mettre à jour l'utilisateur" },
            { status: 500 }
        );
    }
}

/**
 * DELETE - Supprime un compte utilisateur
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est authentifié
    if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        // Appeler l'API backend
        await serverApiRequest(`/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        });

        return NextResponse.json({
            success: true,
            message: "Compte utilisateur supprimé avec succès"
        });
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        return NextResponse.json(
            { error: "Impossible de supprimer le compte utilisateur" },
            { status: 500 }
        );
    }
}