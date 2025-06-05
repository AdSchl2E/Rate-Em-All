import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { API_CONFIG } from '../../../../lib/api-config';

interface ChangePasswordRequestBody {
    currentPassword: string;
    newPassword: string;
}

interface ErrorResponse {
    error: string;
}

interface SuccessResponse {
    success: boolean;
}

export async function POST(request: Request): Promise<Response> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json<ErrorResponse>({ error: 'Non autorisé' }, { status: 401 });
        }

        const { currentPassword, newPassword }: ChangePasswordRequestBody = await request.json();

        // Validation des mots de passe
        if (!currentPassword || !newPassword) {
            return NextResponse.json<ErrorResponse>({ error: 'Tous les champs sont requis' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json<ErrorResponse>({ 
                error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' 
            }, { status: 400 });
        }

        // Vérifier que l'ID utilisateur est valide
        const userId = session.user.id ? parseInt(session.user.id) : null;

        if (!userId) {
            return NextResponse.json<ErrorResponse>({ error: 'ID utilisateur invalide' }, { status: 400 });
        }

        // Appeler l'API backend avec l'ID correctement formaté
        const response = await fetch(`${API_CONFIG.baseUrl}/user/${userId}/change-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (!response.ok) {
            const errorData: { message?: string } = await response.json();
            return NextResponse.json<ErrorResponse>({ 
                error: errorData.message || 'Échec du changement de mot de passe' 
            }, { status: response.status });
        }

        return NextResponse.json<SuccessResponse>({ success: true });

    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json<ErrorResponse>({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}