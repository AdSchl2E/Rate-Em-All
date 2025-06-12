import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions as auth } from '@/app/api/auth/[...nextauth]/route';
import ProfileContainer from '@/components/client/profile/ProfileContainer';

export async function ProfilePage() {
  // Vérifier l'authentification côté serveur
  const session = await getServerSession(auth);
  
  // Rediriger si non connecté
  if (!session) {
    redirect('/login?callbackUrl=/profile');
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="sr-only">Mon profil</h1>
      <ProfileContainer />
    </div>
  );
}