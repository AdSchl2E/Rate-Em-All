import { ClientPokemonExplorer } from '../../components/client/pages/ClientPokemonExplorer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorer les Pokémon | Rate-Em-All',
  description: 'Découvrez et notez tous les Pokémon',
};

export default function ExplorerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explorez les Pokémon</h1>
      <ClientPokemonExplorer />
    </div>
  );
}
