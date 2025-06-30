import TopRatedContainer from '@/components/client/pokemon/top-rated/TopRatedContainer';
import { serverPokemon } from '@/lib/api/server';
import PageHeader from '@/components/server/shared/PageHeader';

/**
 * TopRatedPage component
 * 
 * Server component that renders the top rated Pokémon page.
 * Fetches initial top-rated Pokémon data for the client component.
 * 
 * @returns React server component
 */
export async function TopRatedPage() {
  // Fetch data from the server
  const topPokemon = await serverPokemon.getTopRated(50);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Pokémon Rankings"
        description="The highest rated Pokémon by the community"
      />
      
      {/* Client component for interactivity */}
      <TopRatedContainer initialPokemons={topPokemon} />
    </div>
  );
}