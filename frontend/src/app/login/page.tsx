import { Metadata } from 'next';
import { LoginPage } from '@/components/server/auth/LoginPage';

export const metadata: Metadata = {
  title: 'Connexion | Rate-Em-All',
  description: 'Connectez-vous à votre compte Rate-Em-All pour noter vos Pokémon préférés',
};

// Cette fonction est automatiquement un composant serveur dans Next.js App Router
export default function Page() {
  // Utilise le composant serveur qui à son tour injecte le composant client où nécessaire
  return <LoginPage />;
}
