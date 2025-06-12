import { Metadata } from 'next';
import { TopRatedPage } from '@/components/server/pokemon/TopRatedPage';

export const metadata: Metadata = {
  title: 'Top Pokémon | Rate-Em-All',
  description: 'Découvrez les Pokémon les mieux notés par la communauté',
};

export default function Page() {
  // Ce composant est automatiquement un Server Component
  return <TopRatedPage />;
}