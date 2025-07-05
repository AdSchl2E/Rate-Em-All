import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { serverApi } from '@/lib/api';
import { PokemonDetailPage } from '@/components/server/pokemon/PokemonDetailPage';

// Dynamic metadata generation
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const pokemon = await serverApi.pokemon.getDetails(id);
    
    return {
      title: `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} | Rate 'em All`,
      description: `Rate and discover ${pokemon.name} on Rate 'em All.`,
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
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error
  ) {
    return {
      title: "Pokémon | Rate 'em All"
    };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    return <PokemonDetailPage id={id} />;
  } catch (error) {
    console.error("Error loading Pokémon details:", error);
    notFound();
  }
}