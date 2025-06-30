import { notFound } from 'next/navigation';
import { serverPokemon } from '@/lib/api/server';
import PokemonCard from '@/components/client/shared/PokemonCard';
import RelatedPokemonSection from './RelatedPokemonSection';
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
    const pokemon = await serverPokemon.getDetails(id);
    
    // Get Pokémon of the same type (for recommendations)
    const sameTypePokemon = await serverPokemon.getPokemonByType(
      pokemon.types?.[0]?.type.name || '',
      14,
      [pokemon.id]
    );
    
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
        {sameTypePokemon.length > 0 && (
          <RelatedPokemonSection 
            pokemonList={sameTypePokemon} 
            title={`Other ${pokemon.types?.[0]?.type.name} type Pokémon`}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading Pokémon details:", error);
    notFound();
  }
}