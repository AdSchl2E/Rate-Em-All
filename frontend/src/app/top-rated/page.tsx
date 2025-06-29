import { Metadata } from 'next';
import { TopRatedPage } from '@/components/server/pokemon/TopRatedPage';

export const metadata: Metadata = {
  title: "Top Pokémon | Rate 'em All",
  description: 'Discover the highest rated Pokémon by the community',
};

export default function Page() {
  // This component is automatically a Server Component
  return <TopRatedPage />;
}