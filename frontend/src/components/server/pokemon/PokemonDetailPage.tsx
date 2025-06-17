import { notFound } from 'next/navigation';
import { serverPokemon } from '@/lib/api/server';
import PokemonCard from '@/components/client/shared/PokemonCard';
import RelatedPokemonSection from './RelatedPokemonSection';
import PageHeader from '@/components/server/shared/PageHeader';

interface PokemonDetailPageProps {
  id: number;
}

export async function PokemonDetailPage({ id }: PokemonDetailPageProps) {
  try {
    // Récupération des données Pokémon depuis le serveur avec tous les détails
    const pokemon = await serverPokemon.getDetails(id);
    
    // Récupérer des Pokémon du même type (pour recommandations)
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
          backLabel="Retour à l'exploration"
        />
        
        {/* Utiliser PokemonCard en mode 'detail' pour le Pokémon principal */}
        <PokemonCard 
          pokemon={pokemon}
          viewMode="detail"
          showActions={true}
          showRating={true}
        />
        
        {/* Section des Pokémon similaires */}
        {sameTypePokemon.length > 0 && (
          <RelatedPokemonSection 
            pokemonList={sameTypePokemon} 
            title={`Autres Pokémon de type ${pokemon.types?.[0]?.type.name}`}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement des détails du Pokémon:", error);
    notFound();
  }
}