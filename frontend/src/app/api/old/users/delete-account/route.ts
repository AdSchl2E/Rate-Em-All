import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { API_CONFIG } from '../../../../lib/api-config';

interface DeleteAccountResponse {
    success?: boolean;
    error?: string;
}

interface BackendErrorResponse {
    message?: string;
}

export async function DELETE(request: Request): Promise<NextResponse<DeleteAccountResponse>> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json<DeleteAccountResponse>({ error: 'Non autorisé' }, { status: 401 });
        }

        // Appel à l'API backend pour supprimer le compte
        const response = await fetch(`${API_CONFIG.baseUrl}/user/${session.user.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData: BackendErrorResponse = await response.json();
            return NextResponse.json<DeleteAccountResponse>({ 
                error: errorData.message || 'Échec de la suppression du compte' 
            }, { status: response.status });
        }

        return NextResponse.json<DeleteAccountResponse>({ success: true });

    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json<DeleteAccountResponse>({ 
            error: 'Erreur lors de la suppression du compte. Veuillez réessayer.' 
        }, { status: 500 });
    }
}