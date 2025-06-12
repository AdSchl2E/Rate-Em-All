import { Metadata } from 'next';
import { PokemonExplorerPage } from '@/components/server/explorer/PokemonExplorerPage';

export const metadata: Metadata = {
  title: 'Explorer les Pokémon | Rate-Em-All',
  description: 'Découvrez et notez tous les Pokémon',
};

export default function ExplorerPage() {
  return <PokemonExplorerPage />;
}
