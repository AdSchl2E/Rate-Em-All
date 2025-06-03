import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchPokemonDetails } from '../../../lib/api-server/pokemon';
import { PokemonDetailsClient } from '../../../components/client/pokemon/PokemonDetailsClient';
import { ServerPokemonInfo } from '../../../components/server/pokemon/ServerPokemonInfo';

// Génération dynamique de métadonnées
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const id = parseInt(params.id);
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
    const id = parseInt(params.id);
    const pokemon = await fetchPokemonDetails(id);
    
    return (
      <div className="space-y-8">
        {/* Partie statique rendue côté serveur */}
        <ServerPokemonInfo pokemon={pokemon} />
        
        {/* Partie interactive chargée côté client */}
        <PokemonDetailsClient pokemon={pokemon} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}