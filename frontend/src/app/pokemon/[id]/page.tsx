import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchPokemonDetails } from '../../../lib/api-server/pokemon';
import { PokemonDetailsClient } from '../../../components/client/pokemon/PokemonDetailsClient';

// Génération dynamique de métadonnées avec gestion correcte des params
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Utiliser une promesse résolue pour satisfaire l'exigence de Next.js
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id);
    const pokemon = await fetchPokemonDetails(id);
    
    return {
      title: `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} | Rate-Em-All`,
      description: `Notez et découvrez ${pokemon.name} sur Rate-Em-All.`,
      openGraph: {
        images: [
          {
            url: pokemon.sprites.other['official-artwork'].front_default,
            width: 600,
            height: 600,
            alt: pokemon.name
          }
        ]
      }
    };
  } catch (error) {
    return {
      title: 'Pokémon | Rate-Em-All'
    };
  }
}

export default async function PokemonDetailPage({ params }: { params: { id: string } }) {
  try {
    // Utiliser une promesse résolue pour satisfaire l'exigence de Next.js
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id);
    const pokemon = await fetchPokemonDetails(id);
    
    return (
      <div className="space-y-8">
        {/* Partie interactive chargée côté client */}
        <PokemonDetailsClient pokemon={pokemon} />
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement des détails du Pokémon:", error);
    notFound();
  }
}