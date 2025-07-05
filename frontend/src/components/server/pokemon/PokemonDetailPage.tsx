import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/api';
import PokemonCard from '@/components/client/shared/PokemonCard';
import RelatedPokemonSection from '@/components/client/pokemon/RelatedPokemonSection';
import PageHeader from '@/components/server/shared/PageHeader';

/**
 * PokemonDetailPage props interface
 */
interface PokemonDetailPageProps {
  /** Pokémon ID to display */
  id: number;
}

/**
 * PokemonDetailPage component
 * 
 * Server component that renders detailed information about a specific Pokémon.
 * Fetches the Pokémon data and related Pokémon of the same type.
 * 
 * @param props - Component props
 * @returns React server component
 */
export async function PokemonDetailPage({ id }: PokemonDetailPageProps) {
  try {
    // Fetch Pokémon data from the server with all details
    const pokemon = await serverApi.pokemon.getDetails(id);
    
    return (
      <div className="container mx-auto px-4 py-6 space-y-8 max-w-5xl">
        <PageHeader
          showBackButton={true}
          backUrl="/explorer"
          backLabel="Back to explorer"
        />
        
        {/* Use PokemonCard in 'detail' mode for the main Pokémon */}
        <PokemonCard 
          pokemon={pokemon}
          viewMode="detail"
          showActions={true}
          showRating={true}
        />
        
        {/* Similar Pokémon section */}
        <RelatedPokemonSection 
          currentPokemon={pokemon}
          currentPokemonId={pokemon.id}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading Pokémon details:", error);
    notFound();
  }
}