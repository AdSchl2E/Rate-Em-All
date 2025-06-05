import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { API_CONFIG } from '../../../../lib/api-config';

interface UpdateProfileRequestBody {
    username: string;
}

interface UpdateProfileSuccessResponse {
    success: true;
    user: unknown;
}

interface UpdateProfileErrorResponse {
    error: string;
}

export async function POST(request: Request): Promise<NextResponse<UpdateProfileSuccessResponse | UpdateProfileErrorResponse>> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json<UpdateProfileErrorResponse>({ error: 'Non autorisé' }, { status: 401 });
        }

        const { username }: UpdateProfileRequestBody = await request.json();

        // Validation du pseudo
        if (!username || username.trim() === '') {
            return NextResponse.json<UpdateProfileErrorResponse>({ error: 'Le pseudo est requis' }, { status: 400 });
        }

        // Appeler l'API backend pour mettre à jour le profil
        const response = await fetch(`${API_CONFIG.baseUrl}/user/${session.user.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: username })
        });

        if (!response.ok) {
            const errorData: { message?: string } = await response.json();
            return NextResponse.json<UpdateProfileErrorResponse>({ 
                error: errorData.message || 'Échec de la mise à jour du profil' 
            }, { status: response.status });
        }

        const data: unknown = await response.json();
        return NextResponse.json<UpdateProfileSuccessResponse>({ 
            success: true, 
            user: data
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json<UpdateProfileErrorResponse>({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}