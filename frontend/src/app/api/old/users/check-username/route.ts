import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { API_CONFIG } from '../../../../lib/api-config';

interface CheckUsernameResponse {
    available: boolean;
}

interface ErrorResponse {
    error: string;
}

interface SessionUser {
    id: string;
    [key: string]: any;
}

interface Session {
    user?: SessionUser;
    accessToken?: string;
    [key: string]: any;
}

export async function GET(request: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const username: string | null = searchParams.get('username');
        
        if (!username) {
            return NextResponse.json<ErrorResponse>({ error: 'Le pseudo est requis' }, { status: 400 });
        }
        
        // Récupérer la session utilisateur
        const session: Session | null = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json<ErrorResponse>({ error: 'Non autorisé' }, { status: 401 });
        }
        
        // Modifier la requête pour s'assurer que l'ID est bien un nombre
        const userId = session.user.id ? parseInt(session.user.id) : null;

        if (!userId) {
            return NextResponse.json<ErrorResponse>({ error: 'ID utilisateur invalide' }, { status: 400 });
        }

        // Ajouter le débogage pour voir ce qui est envoyé
        console.log("Sending request with userId:", userId, "and username:", username);

        // Appeler l'API backend pour vérifier si le pseudo est disponible
        const response: globalThis.Response = await fetch(
            `${API_CONFIG.baseUrl}/user/check-username?username=${encodeURIComponent(username)}&userId=${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Améliorer le débogage des erreurs
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erreur backend (${response.status}):`, errorText);
            throw new Error(`Erreur lors de la vérification du pseudo: ${response.status}`);
        }
        
        const data: CheckUsernameResponse = await response.json();
        return NextResponse.json<CheckUsernameResponse>({ available: data.available });
        
    } catch (error) {
        console.error('Error checking username:', error);
        return NextResponse.json<ErrorResponse>({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}