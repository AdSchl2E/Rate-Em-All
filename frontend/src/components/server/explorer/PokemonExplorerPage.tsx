import { serverPokemon } from '@/lib/api/server';
import ExplorerContainer from '@/components/client/explorer/ExplorerContainer';
import PageHeader from '@/components/server/shared/PageHeader';

export async function PokemonExplorerPage() {
  // Charger uniquement les métadonnées initiales nécessaires pour les filtres
  // (évite de charger tous les Pokémon immédiatement)
  const pokemonTypes = await serverPokemon.getAllTypes();
  const totalPokemonCount = await serverPokemon.getTotalCount();
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PageHeader 
        title="Explorez les Pokémon"
        description="Découvrez, filtrez et notez tous les Pokémon existants"
      />
      
      <ExplorerContainer 
        initialTypes={pokemonTypes}
        totalCount={totalPokemonCount}
      />
    </div>
  );
}