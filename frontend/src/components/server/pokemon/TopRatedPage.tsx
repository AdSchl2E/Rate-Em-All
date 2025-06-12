import TopRatedContainer from '@/components/client/pokemon/top-rated/TopRatedContainer';
import { serverPokemon } from '@/lib/api/server';
import PageHeader from '@/components/server/shared/PageHeader';

export async function TopRatedPage() {
  // Récupération des données depuis le serveur
  const topPokemon = await serverPokemon.getTopRated(50);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Palmarès des Pokémon"
        description="Les Pokémon les mieux notés par la communauté"
      />
      
      {/* Composant client pour l'interactivité */}
      <TopRatedContainer initialPokemons={topPokemon} />
    </div>
  );
}