import { Suspense } from 'react';
import { serverPokemon } from '@/lib/api/server';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import HeroSection from '@/components/client/home/HeroSection';
import PokemonCarousel from '@/components/client/home/PokemonCarousel';
import RandomPokemonShowcase from '@/components/client/home/RandomPokemonShowcase';
import { AuthCTA } from '@/components/client/auth/AuthCTA';

export async function HomePage() {
  // Récupération des données Pokémon côté serveur
  const { pokemons: allPokemons } = await serverPokemon.getAll(0, 100);
  
  // Récupérer les Pokémon avec les meilleures notes pour le second carrousel
  const topRatedPokemons = await serverPokemon.getTopRated(20);
  
  return (
    <div className="space-y-16 py-8">
      {/* Hero section */}
      <HeroSection />
      
      {/* Carrousel de Pokémon populaires */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <div className="container mx-auto px-4">
          <PokemonCarousel pokemons={allPokemons} />
        </div>
      </Suspense>
      
      {/* Carrousel de Pokémon mieux notés en mode aléatoire */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <div className="container mx-auto px-4">
          <RandomPokemonShowcase pokemons={topRatedPokemons} />
        </div>
      </Suspense>
      
      {/* CTA d'authentification */}
      <AuthCTA />
    </div>
  );
}