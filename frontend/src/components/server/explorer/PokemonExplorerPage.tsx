import { serverPokemon } from '@/lib/api/server';
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
  // Load only the initial metadata needed for filters
  // (avoids loading all Pokemon immediately)
  const pokemonTypes = await serverPokemon.getAllTypes();
  const totalPokemonCount = await serverPokemon.getTotalCount();
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PageHeader 
        title="Explore Pokémon"
        description="Discover and rate all existing Pokémon"
      />
      
      <ExplorerContainer 
        initialTypes={pokemonTypes}
        totalCount={totalPokemonCount}
      />
    </div>
  );
}