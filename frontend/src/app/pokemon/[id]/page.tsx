import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { serverPokemon } from '@/lib/api/server';
import { PokemonDetailPage } from '@/components/server/pokemon/PokemonDetailPage';

// Génération dynamique de métadonnées
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const id = parseInt(params.id);
    const pokemon = await serverPokemon.getDetails(id);
    
    return {
      title: `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} | Rate 'em All`,
      description: `Notez et découvrez ${pokemon.name} sur Rate 'em All.`,
      openGraph: {
        images: [
          {
            url: pokemon.sprites.other?.['official-artwork']?.front_default || '/images/pokeball.png',
            width: 600,
            height: 600,
            alt: pokemon.name
          }
        ]
      }
    };
  } catch (error) {
    return {
      title: "Pokémon | Rate 'em All"
    };
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    return <PokemonDetailPage id={id} />;
  } catch (error) {
    console.error("Erreur lors du chargement des détails du Pokémon:", error);
    notFound();
  }
}