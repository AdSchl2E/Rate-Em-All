import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions as auth } from '@/app/api/auth/[...nextauth]/route';
import SettingsContainer from '@/components/client/settings/SettingsContainer';

export async function UserSettingsPage() {
  // Vérification de l'authentification côté serveur
  const session = await getServerSession(auth);
  
  // Redirection si l'utilisateur n'est pas connecté
  if (!session) {
    redirect('/login?callbackUrl=/settings');
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <SettingsContainer />
    </div>
  );
}