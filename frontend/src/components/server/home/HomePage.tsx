import { Suspense } from 'react';
import { serverApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import HeroSection from '@/components/server/home/HeroSection';
import PokemonCarousel from '@/components/client/home/PokemonCarousel';
import RandomPokemonShowcase from '@/components/client/home/RandomPokemonShowcase';
import { AuthCTA } from '@/components/client/auth/AuthCTA';

/**
 * HomePage component
 * 
 * Server component that renders the main landing page.
 * Fetches initial Pokemon data for display in carousels and showcases.
 * 
 * @returns React server component
 */
export async function HomePage() {
  // Fetch Pokemon data server-side
  const { pokemons: allPokemons } = await serverApi.pokemon.getList({ page: 0, limit: 100 });
  
  // Get the top rated Pokemon for the second carousel
  const topRatedPokemons = await serverApi.pokemon.getTopRated(20);
  
  return (
    <div className="space-y-16 py-8">
      {/* Hero section */}
      <HeroSection />
      
      {/* Popular Pokemon carousel */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <div className="container mx-auto px-4">
          <PokemonCarousel pokemons={allPokemons} />
        </div>
      </Suspense>
      
      {/* Top rated Pokemon carousel in random mode */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <div className="container mx-auto px-4">
          <RandomPokemonShowcase pokemons={topRatedPokemons} />
        </div>
      </Suspense>
      
      {/* Authentication CTA */}
      <AuthCTA />
    </div>
  );
}