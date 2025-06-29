import { Metadata } from 'next';
import { FavoritesPage } from '@/components/server/pokemon/FavoritesPage';

export const metadata: Metadata = {
  title: "My Favorites | Rate 'em All",
  description: 'Manage your favorite Pokémon',
};

// This function is automatically a server component in Next.js App Router
export default function Page() {
  return <FavoritesPage />;
}