import { Metadata } from 'next';
import { PokemonExplorerPage } from '@/components/server/explorer/PokemonExplorerPage';

export const metadata: Metadata = {
  title: "Explore Pokémon | Rate 'em All",
  description: 'Discover and rate all Pokémon',
};

export default function ExplorerPage() {
  return <PokemonExplorerPage />;
}
