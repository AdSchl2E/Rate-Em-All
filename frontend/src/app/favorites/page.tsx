import { Metadata } from 'next';
import { FavoritesClient } from '../../components/client/pages/FavoritesClient';

export const metadata: Metadata = {
  title: 'Mes Favoris | Rate-Em-All',
  description: 'Gérez vos Pokémon favoris',
};

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mes Pokémon Favoris</h1>
      <FavoritesClient />
    </div>
  );
}