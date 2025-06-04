import { Metadata } from 'next';
import { fetchTopRated } from '../../lib/api-server/pokemon';
import { TopRatedClient } from '../../components/client/pages/TopRatedClient';

export const metadata: Metadata = {
  title: 'Top Pokémon | Rate-Em-All',
  description: 'Découvrez les Pokémon les mieux notés par la communauté',
};

export default async function TopRatedPage() {

  const topPokemon = await fetchTopRated(50);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">
          Palmarès des Pokémon
        </h1>
        <p className="text-gray-400">Les Pokémon les mieux notés par la communauté</p>
      </div>
      
      {/* Partie client pour le filtrage et l'interaction */}
      <TopRatedClient initialPokemons={topPokemon} />
    </div>
  );
}