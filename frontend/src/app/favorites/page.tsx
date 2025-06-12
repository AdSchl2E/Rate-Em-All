import { Metadata } from 'next';
import { FavoritesPage } from '@/components/server/pokemon/FavoritesPage';

export const metadata: Metadata = {
  title: 'Mes Favoris | Rate-Em-All',
  description: 'Gérez vos Pokémon favoris',
};

// Cette fonction est automatiquement un composant serveur dans Next.js App Router
export default function Page() {
  return <FavoritesPage />;
}