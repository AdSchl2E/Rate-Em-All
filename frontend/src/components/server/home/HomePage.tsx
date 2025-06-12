import { Suspense } from 'react';
import { serverPokemon } from '@/lib/api/server';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import HeroSection from '@/components/client/home/HeroSection';
import PokemonCarousel from '@/components/client/home/PokemonCarousel';
import { AuthCTA } from '@/components/client/auth/AuthCTA';
import TopRatedSection from './TopRatedSection';

export async function HomePage() {
  // Récupération des données Pokémon côté serveur
  const { pokemons: allPokemons } = await serverPokemon.getAll(0, 100);  // Utilisez getAll au lieu de getAllPokemon
  const topRatedPokemons = await serverPokemon.getTopRated(6); // Paramètre positionnel
  
  return (
    <div className="space-y-12">
      {/* Hero section */}
      <HeroSection />
      
      {/* Carrousel de Pokémon */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <PokemonCarousel pokemons={allPokemons} />
      </Suspense>
      
      {/* Section Top Rated */}
      <TopRatedSection pokemons={topRatedPokemons} />
      
      {/* CTA d'authentification */}
      <AuthCTA />
    </div>
  );
}