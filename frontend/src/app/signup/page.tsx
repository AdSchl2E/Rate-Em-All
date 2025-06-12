import { Metadata } from 'next';
import { SignupPage } from '@/components/server/auth/SignupPage';

export const metadata: Metadata = {
  title: 'Inscription | Rate-Em-All',
  description: 'Créez votre compte Rate-Em-All pour noter et sauvegarder vos Pokémon préférés',
};

// Cette fonction est automatiquement un composant serveur dans Next.js App Router
export default function Page() {
  // Utilise le composant serveur qui à son tour injecte le composant client où nécessaire
  return <SignupPage />;
}
