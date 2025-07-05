import { serverApi } from '@/lib/api';
import ExplorerContainer from '@/components/client/explorer/ExplorerContainer';
import PageHeader from '@/components/server/shared/PageHeader';

/**
 * PokemonExplorerPage component
 * 
 * Server component that renders the Pokemon explorer page.
 * Fetches initial metadata for filters and passes it to the client component.
 * 
 * @returns React server component
 */
export async function PokemonExplorerPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PageHeader 
        title="Explore Pokémon"
        description="Discover and rate all existing Pokémon"
      />
      
      <ExplorerContainer />
    </div>
  );
}